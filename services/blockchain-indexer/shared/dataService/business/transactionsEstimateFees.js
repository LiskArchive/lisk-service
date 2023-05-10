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
const { HTTP } = require('lisk-service-framework');

const { isMainchain, resolveMainchainServiceURL } = require('./mainchain');
const { dryRunTransactions } = require('./transactionsDryRun');
const { tokenHasUserAccount, getTokenConstants } = require('./token');

const { MODULE, COMMAND, EVENT } = require('../../constants');
const regex = require('../../regex');
const { parseToJSONCompatObj } = require('../../utils/parser');
const { requestConnector, requestFeesEstimator } = require('../../utils/request');

const resolveChannelInfo = async (chainID) => {
	if ((await isMainchain()) && !regex.MAINCHAIN_ID.test(chainID)) {
		// Redirect call to the mainchain service
		const serviceURL = await resolveMainchainServiceURL();
		const invokeEndpoint = `${serviceURL}/api/v3/invoke`;
		const channelInfo = await HTTP.post(invokeEndpoint, { endpoint: 'interoperability_getChannel', params: { chainID } });
		return channelInfo;
	}

	const channelInfo = await requestConnector('getChannel', { chainID });
	return channelInfo;
};

const calcMessageFee = async (transaction) => {
	const { data: { events } } = (await dryRunTransactions({ transaction }));
	const ccmSendSuccess = events.find(event => event.name === EVENT.CCM_SEND_SUCCESS);

	// Encode ccm (required to calculate ccm length)
	const { ccm } = ccmSendSuccess.data;
	const ccmEncoded = await requestConnector('encodeCCM', { ccm });
	const ccmBuffer = Buffer.from(ccmEncoded, 'hex');
	const channelInfo = await resolveChannelInfo(transaction.params.receivingChainID);

	return {
		tokenID: channelInfo.messageFeeTokenID,
		amount: BigInt(ccmBuffer.length) * BigInt(channelInfo.minReturnFeePerByte),
	};
};

const calcDynamicFeeEstimates = (feeEstimatePerByte, minFee, size) => ({
	low: BigInt(minFee) + (BigInt(feeEstimatePerByte.low) * BigInt(size)),
	medium: BigInt(minFee) + (BigInt(feeEstimatePerByte.med) * BigInt(size)),
	high: BigInt(minFee) + (BigInt(feeEstimatePerByte.high) * BigInt(size)),
});

// eslint-disable-next-line consistent-return
const calcAccountInitializationFees = async (transaction, tokenID) => {
	const { data: { isExists: isUserAccountInitialized } } = (await tokenHasUserAccount(
		{
			tokenID,
			publicKey: transaction.senderPublicKey,

		},
	));

	if (!isUserAccountInitialized) {
		const { data: { extraCommandFees } } = (await getTokenConstants());
		return {
			tokenID,
			amount: extraCommandFees.userAccountInitializationFee,
		};
	}
};

const estimateTransactionFees = async params => {
	const estimateTransactionFeesRes = {
		data: [],
		meta: {},
	};

	const transaction = await requestConnector('formatTransaction', { transaction: params.transaction });

	const { minFee, size } = transaction;
	const feeEstimatePerByte = await requestFeesEstimator('estimates');
	const dynamicFeeEstimates = calcDynamicFeeEstimates(feeEstimatePerByte, minFee, size);

	const transactionFeeEstimates = {};
	transactionFeeEstimates.minFee = minFee;

	const { feeTokenID } = feeEstimatePerByte;
	transactionFeeEstimates.accountInitializationFee = transaction.module === MODULE.TOKEN
		? await calcAccountInitializationFees(transaction, feeTokenID)
		: {};

	transactionFeeEstimates.messageFee = (transaction.command === COMMAND.TRANSFER_CROSS_CHAIN)
		? await calcMessageFee(transaction)
		: {};

	estimateTransactionFeesRes.data = {
		transactionFeeEstimates,
		dynamicFeeEstimates,
	};

	return parseToJSONCompatObj(estimateTransactionFeesRes);
};

module.exports = {
	estimateTransactionFees,

	// Export for the unit test
	calcDynamicFeeEstimates,
};
