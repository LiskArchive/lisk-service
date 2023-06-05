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

const { HTTP } = require('lisk-service-framework');

const { getAuthAccountInfo } = require('./auth');
const { isMainchain, resolveMainchainServiceURL } = require('./mainchain');
const { dryRunTransactions } = require('./transactionsDryRun');
const { tokenHasUserAccount, getTokenConstants } = require('./token');

const { MODULE, COMMAND, EVENT } = require('../../constants');
const regex = require('../../regex');

const { getLisk32AddressFromPublicKey } = require('../../utils/account');
const { parseToJSONCompatObj } = require('../../utils/parser');
const { requestConnector, requestFeeEstimator } = require('../../utils/request');

const SIZE_BYTE_SIGNATURE = 64;
const SIZE_BYTE_ID = 32;

const OPTIONAL_TRANSACTION_PROPERTIES = Object.freeze({
	FEE: {
		propName: 'fee',
		defaultValue: () => '0',
	},
	SIGNATURES: {
		propName: 'signatures',
		defaultValue: (count) => new Array(count).fill().map(() => getRandomBytes(SIZE_BYTE_SIGNATURE).toString('hex')),
	},
	ID: {
		propName: 'id',
		defaultValue: () => getRandomBytes(SIZE_BYTE_ID).toString('hex'),
	},
});

const OPTIONAL_TRANSACTION_PARAMS_PROPERTIES = Object.freeze({
	MESSAGE_FEE: {
		propName: 'messageFee',
		defaultValue: () => Number.MAX_VALUE,
	},
	MESSAGE_FEE_TOKEN_ID: {
		propName: 'messageFeeTokenID',
		defaultValue: () => '0000000000000000', // TODO: Resolve dynamically
	},
});

const mockOptionalProperties = (_transaction, signaturesCount) => {
	const transaction = _.cloneDeep(_transaction);

	// TODO: Improve
	Object
		.values(OPTIONAL_TRANSACTION_PROPERTIES)
		.forEach(optionalPropInfo => {
			if (!(optionalPropInfo.propName in transaction)) {
				transaction[optionalPropInfo.propName] = optionalPropInfo.defaultValue(signaturesCount);
			}
		});

	Object
		.values(OPTIONAL_TRANSACTION_PARAMS_PROPERTIES)
		.forEach(optionalPropInfo => {
			if (!(optionalPropInfo.propName in transaction.params)) {
				transaction.params[optionalPropInfo.propName] = optionalPropInfo.defaultValue();
			}
		});

	return transaction;
};

const resolveChannelInfo = async (chainID) => {
	if (await isMainchain() && !regex.MAINCHAIN_ID.test(chainID)) {
		const channelInfo = await requestConnector('getChannel', { chainID });
		return channelInfo;
	}

	// Redirect call to the mainchain service
	const serviceURL = await resolveMainchainServiceURL();
	const invokeEndpoint = `${serviceURL}/api/v3/invoke`;
	const { data: { data: channelInfo } } = await HTTP.post(
		invokeEndpoint,
		{
			endpoint: 'interoperability_getChannel',
			params: { chainID },
		},
	);

	return channelInfo;
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
		amount: BigInt(ccmBuffer.length) * BigInt(channelInfo.minReturnFeePerByte),
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

	const signaturesCount = authAccountInfo.numberOfSignatures + 1;
	const trxWithMockProps = mockOptionalProperties(params.transaction, signaturesCount);
	const transaction = await requestConnector('formatTransaction', { transaction: trxWithMockProps });

	const { minFee, size } = transaction;

	const transactionFeeEstimates = {
		minFee,
		accountInitializationFee: await calcAccountInitializationFees(transaction),
		messageFee: await calcMessageFee(transaction),
	};

	const feeEstimatePerByte = await requestFeeEstimator('estimates');
	const dynamicFeeEstimates = calcDynamicFeeEstimates(feeEstimatePerByte, minFee, size);

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
	mockOptionalProperties,
};
