/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
const _ = require('lodash');
const {
	utils: { getRandomBytes },
} = require('@liskhq/lisk-cryptography');

const {
	HTTP,
	Exceptions: { ValidationException },
} = require('lisk-service-framework');

const { getAuthAccountInfo } = require('./auth');
const { resolveMainchainServiceURL, resolveChannelInfo } = require('./mainchain');
const { dryRunTransactions } = require('./transactionsDryRun');
const { tokenHasUserAccount, getTokenConstants } = require('./token');

const { MODULE, COMMAND, EVENT } = require('../../constants');

const { getLisk32AddressFromPublicKey } = require('../../utils/account');
const { parseToJSONCompatObj } = require('../../utils/parser');
const { requestConnector, requestFeeEstimator } = require('../../utils/request');
const config = require('../../../config');

const SIZE_BYTE_SIGNATURE = 64;
const SIZE_BYTE_ID = 32;
const { defaultBytesLength } = config.estimateFees;

const OPTIONAL_TRANSACTION_PROPERTIES = Object.freeze({
	FEE: {
		propName: 'fee',
		defaultValue: () => '0',
	},
	SIGNATURES: {
		propName: 'signatures',
		defaultValue: (numberOfSignatures) => new Array(numberOfSignatures)
			.fill()
			.map(() => getRandomBytes(SIZE_BYTE_SIGNATURE).toString('hex')),
	},
	ID: {
		propName: 'id',
		defaultValue: () => getRandomBytes(SIZE_BYTE_ID).toString('hex'),
	},
});

const OPTIONAL_TRANSACTION_PARAMS_PROPERTIES = Object.freeze({
	MESSAGE_FEE: {
		propName: 'messageFee',
		defaultValue: () => '0',
	},
	MESSAGE_FEE_TOKEN_ID: {
		propName: 'messageFeeTokenID',
		defaultValue: (messageFeeTokenID) => messageFeeTokenID,
	},
});

const mockOptionalProperties = (inputObject, objectOptionalProps, additionalParam) => {
	Object
		.values(objectOptionalProps)
		.forEach(optionalPropInfo => {
			if (!(optionalPropInfo.propName in inputObject)) {
				inputObject[optionalPropInfo.propName] = optionalPropInfo.defaultValue(additionalParam);
			}
		});

	return inputObject;
};

const mockTransaction = async (_transaction, authAccountInfo) => {
	const transaction = _.cloneDeep(_transaction);

	const numberOfSignatures = authAccountInfo.numberOfSignatures !== 0
		? (authAccountInfo.mandatoryKeys.concat(authAccountInfo.optionalKeys)).length
		: 1;

	const mockedTransaction = mockOptionalProperties(
		transaction,
		OPTIONAL_TRANSACTION_PROPERTIES,
		numberOfSignatures,
	);

	let messageFeeTokenID;
	if (transaction.module === MODULE.TOKEN && transaction.command === COMMAND.TRANSFER_CROSS_CHAIN) {
		const channelInfo = await resolveChannelInfo(transaction.params.receivingChainID);
		messageFeeTokenID = channelInfo.messageFeeTokenID;
	}

	const mockedTransactionParams = transaction.module === MODULE.TOKEN
		&& transaction.command === COMMAND.TRANSFER_CROSS_CHAIN
		? mockOptionalProperties(
			transaction.params,
			OPTIONAL_TRANSACTION_PARAMS_PROPERTIES,
			messageFeeTokenID,
		)
		: transaction.params;

	return { ...mockedTransaction, params: mockedTransactionParams };
};

const calcMessageFee = async (transaction) => {
	if (transaction.module !== MODULE.TOKEN
		|| transaction.command !== COMMAND.TRANSFER_CROSS_CHAIN) return {};

	const { data: { events } } = await dryRunTransactions({ transaction, skipVerify: true });
	const ccmSendSuccess = events.find(event => event.name === EVENT.CCM_SEND_SUCCESS);

	// Encode CCM (required to calculate ccm length)
	const { ccm } = ccmSendSuccess.data;
	const ccmEncoded = await requestConnector('encodeCCM', { ccm });
	const ccmBuffer = Buffer.from(ccmEncoded, 'hex');
	const channelInfo = await resolveChannelInfo(transaction.params.receivingChainID);

	return {
		tokenID: channelInfo.messageFeeTokenID,
		amount: BigInt(ccmBuffer.length + defaultBytesLength) * BigInt(channelInfo.minReturnFeePerByte),
	};
};

const calcDynamicFeeEstimates = (estimatePerByte, minFee, size) => ({
	low: BigInt(minFee) + (BigInt(estimatePerByte.low) * BigInt(size)),
	medium: BigInt(minFee) + (BigInt(estimatePerByte.med) * BigInt(size)),
	high: BigInt(minFee) + (BigInt(estimatePerByte.high) * BigInt(size)),
});

const calcAccountInitializationFees = async (transaction) => {
	const { tokenID } = transaction.params;

	if (transaction.command === COMMAND.TRANSFER_CROSS_CHAIN) {
		const mainchainServiceURL = await resolveMainchainServiceURL();
		const { data: appMetadataResponse } = await HTTP
			.get(`${mainchainServiceURL}/api/v3/blockchain/apps/meta?chainID=${transaction.params.receivingChainID}`);

		if (appMetadataResponse.data.length) {
			const { data: [{ serviceURLs: [{ http: httpServiceURL }] }] } = appMetadataResponse;

			const { data: accountExistsResponse } = await HTTP
				.get(`${httpServiceURL}/api/v3/token/account/exists?tokenID=${tokenID}&address=${transaction.params.recipientAddress}`);
			const { data: { isExists } } = accountExistsResponse;

			// Account already exists, no extra fee necessary
			if (isExists) return { tokenID, amount: BigInt('0') };

			const { data: tokenConstantsResponse } = await HTTP.get(`${httpServiceURL}/api/v3/token/constants`);
			const { data: { extraCommandFees } } = tokenConstantsResponse;

			return {
				tokenID,
				amount: extraCommandFees.userAccountInitializationFee,
			};
		}
		throw new ValidationException(`Application offchain metadata is not available for the chain: ${transaction.params.receivingChainID}.`);
	}

	const { data: { isExists } } = await tokenHasUserAccount({
		tokenID,
		publicKey: transaction.params.recipientAddress,
	});

	// Account already exists, no extra fee necessary
	if (isExists) return { tokenID, amount: BigInt('0') };

	const { data: { extraCommandFees } } = await getTokenConstants();
	return {
		tokenID,
		amount: extraCommandFees.userAccountInitializationFee,
	};
};

const estimateTransactionFees = async params => {
	const estimateTransactionFeesRes = {
		data: {},
		meta: {},
	};

	const { data: authAccountInfo } = await getAuthAccountInfo({
		address: getLisk32AddressFromPublicKey(params.transaction.senderPublicKey),
	});

	const trxWithMockProps = await mockTransaction(params.transaction, authAccountInfo);
	const transaction = await requestConnector('formatTransaction', { transaction: trxWithMockProps });

	const { minFee, size } = transaction;

	const feeEstimatePerByte = await requestFeeEstimator('estimates');

	const transactionFeeEstimates = {
		minFee: minFee + (defaultBytesLength * feeEstimatePerByte.minFeePerByte),
		accountInitializationFee: await calcAccountInitializationFees(transaction),
		messageFee: await calcMessageFee(transaction),
	};

	const dynamicFeeEstimates = calcDynamicFeeEstimates(
		feeEstimatePerByte,
		transactionFeeEstimates.minFee,
		size,
	);

	estimateTransactionFeesRes.data = {
		transactionFeeEstimates,
		dynamicFeeEstimates,
	};

	return parseToJSONCompatObj(estimateTransactionFeesRes);
};

module.exports = {
	estimateTransactionFees,

	// Export for the unit tests
	calcDynamicFeeEstimates,
	mockTransaction,
};
