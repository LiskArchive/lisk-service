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
const { dryRunTransactions } = require('./transactionsDryRun');
const { tokenHasUserAccount, getTokenConstants } = require('./token');
const { MODULE, COMMAND, EVENT } = require('../../constants');
const { parseToJSONCompatObj } = require('../../utils/parser');
const { requestConnector, requestFeesEstimator } = require('../../utils/request');

const calcMessageFee = async (transaction) => {
	const { data: { events } } = (await dryRunTransactions({ transaction }));
	const ccmSendSuccess = events.find(event => event.name === EVENT.CCM_SEND_SUCCESS);

	// Encode ccm (required to calculate ccm length)
	const { ccm } = ccmSendSuccess.data;
	const ccmEncoded = await requestConnector('encodeCCM', { ccm });
	const ccmBuffer = Buffer.from(ccmEncoded, 'hex');

	const channelInfo = await requestConnector('getChannel', { chainID: transaction.params.receivingChainID });
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

const calculateTransactionFees = async params => {
	const calculateTransactionFeesRes = {
		data: [],
		meta: {},
	};

	const transactionFeeEstimates = {};

	const transaction = await requestConnector('formatTransaction', { transaction: params.transaction });

	const { minFee, size } = transaction;
	transactionFeeEstimates.minFee = transaction.minFee;

	const feeEstimatePerByte = await requestFeesEstimator('estimates');
	const dynamicFeeEstimates = calcDynamicFeeEstimates(feeEstimatePerByte, minFee, size);

	const { feeTokenID } = feeEstimatePerByte;
	transactionFeeEstimates.accountInitializationFee = transaction.module === MODULE.TOKEN
		? await calcAccountInitializationFees(transaction, feeTokenID)
		: {};

	transactionFeeEstimates.messageFee = (transaction.command === COMMAND.CROSS_CHAIN_TRANSFER)
		? await calcMessageFee(transaction)
		: {};

	calculateTransactionFeesRes.data = {
		transactionFeeEstimates,
		dynamicFeeEstimates,
	};

	return parseToJSONCompatObj(calculateTransactionFeesRes);
};

module.exports = {
	calculateTransactionFees,
};
