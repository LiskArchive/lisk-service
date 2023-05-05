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
const { codec } = require('@liskhq/lisk-codec');

const { getSchemas } = require('./schemas');
const { dryRunTransactions } = require('./transactionsDryRun');
const { tokenHasUserAccount, getTokenConstants } = require('./token');
const { MODULE, COMMAND, EVENT } = require('../../constants');
const { parseInputBySchema, parseToJSONCompatObj } = require('../../utils/parser');
const { requestConnector, requestFeesEstimator } = require('../../utils/request');

const calcMessageFee = async (transaction, schemas) => {
	const { data: { events } } = (await dryRunTransactions({ transaction }));
	const ccmSendSuccess = events.find(event => event.name === EVENT.CCM_SEND_SUCCESS);

	// In case of decoded ccmParams, encode params (required to calculate ccm length)
	const ccmParamsSchema = (schemas.commands
		.find(e => e.moduleCommand === `${transaction.module}:${transaction.command}`)).schema;
	const { ccm } = ccmSendSuccess.data;
	if (typeof ccm.params === 'object' && !Buffer.isBuffer(ccm.params)) {
		ccm.params = codec.encode(ccmParamsSchema, parseInputBySchema(ccm.params, ccmParamsSchema));
	}

	// Encode ccm Buffer to calculate ccm length
	const { schema: ccmSchema } = schemas.ccm;
	const schemaCompliantCCM = parseInputBySchema(ccm, ccmSchema);
	const ccmBuffer = codec.encode(ccmSchema, schemaCompliantCCM);
	const ccmLength = ccmBuffer.length;

	const channelInfo = await requestConnector('getChannel', { chainID: transaction.params.receivingChainID });
	return {
		tokenID: channelInfo.messageFeeTokenID,
		amount: ccmLength * Number(channelInfo.minReturnFeePerByte),
	};
};

const calcDynamicFeeEstimates = (feeEstimatePerByte, minFee, size) => ({
	low: Number(minFee) + feeEstimatePerByte.low * Number(size),
	medium: Number(minFee) + feeEstimatePerByte.med * Number(size),
	high: Number(minFee) + feeEstimatePerByte.high * Number(size),
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

	const { data: schemas } = (await getSchemas());

	// Decode binary payload
	if (typeof params.transaction === 'string') {
		const transactionSchema = schemas.transaction.schema;
		const decodedTransaction = parseToJSONCompatObj(codec.decode(transactionSchema, Buffer.from(params.transaction, 'hex')));

		const transactionParamsSchema = (schemas.commands
			.find(e => e.moduleCommand === `${decodedTransaction.module}:${decodedTransaction.command}`)).schema;
		const decodedTransactionParams = codec.decode(transactionParamsSchema, Buffer.from(decodedTransaction.params, 'hex'));

		params.transaction = {
			...decodedTransaction,
			params: parseToJSONCompatObj(decodedTransactionParams),
		};
	}

	const { minFee, size } = await requestConnector('getTransactionMinFeeAndSize', { transaction: params.transaction });
	transactionFeeEstimates.minFee = minFee;

	const feeEstimatePerByte = await requestFeesEstimator('estimates');
	const dynamicFeeEstimates = calcDynamicFeeEstimates(feeEstimatePerByte, minFee, size);

	if (params.transaction.module === MODULE.TOKEN) {
		if (params.transaction.command === COMMAND.CROSS_CHAIN_TRANSFER) {
			transactionFeeEstimates.messageFee = await calcMessageFee(params.transaction, schemas);
		} else if (params.transaction.command === COMMAND.TRANSFER) {
			const { feeTokenID } = feeEstimatePerByte;
			transactionFeeEstimates.accountInitializationFee = await calcAccountInitializationFees(
				params.transaction,
				feeTokenID,
			);
		}
	}

	calculateTransactionFeesRes.data = {
		transactionFeeEstimates,
		dynamicFeeEstimates,
	};

	return calculateTransactionFeesRes;
};

module.exports = {
	calculateTransactionFees,
};
