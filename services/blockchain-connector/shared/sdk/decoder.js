/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
const {
	utils: { hash },
} = require('@liskhq/lisk-cryptography');

const {
	getBlockSchema,
	getBlockHeaderSchema,
	getBlockAssetSchema,
	getTransactionSchema,
	getTransactionParamsSchema,
} = require('./schema');

const { parseToJSONCompatObj } = require('../utils/parser');

const decodeTransaction = (encodedTransaction) => {
	const txSchema = getTransactionSchema();
	const transactionBuffer = Buffer.isBuffer(encodedTransaction)
		? encodedTransaction
		: Buffer.from(encodedTransaction, 'hex');
	const transaction = codec.decode(txSchema, transactionBuffer);
	transaction.id = hash(transactionBuffer);
	transaction.size = transactionBuffer.length;

	const txParamsSchema = getTransactionParamsSchema(transaction);
	const transactionParams = codec.decode(txParamsSchema, transaction.params);

	const decodedTransaction = {
		...transaction,
		params: transactionParams,
	};

	return decodedTransaction;
};

const decodeBlock = (encodedBlock) => {
	const blockSchema = getBlockSchema();
	const blockBuffer = Buffer.isBuffer(encodedBlock)
		? encodedBlock
		: Buffer.from(encodedBlock, 'hex');
	const block = codec.decode(blockSchema, blockBuffer);

	const blockHeaderSchema = getBlockHeaderSchema();
	const blockHeader = codec.decode(blockHeaderSchema, block.header);
	blockHeader.id = hash(block.header);

	const blockAssetSchema = getBlockAssetSchema();
	// TODO: Decode 'asset.data' once schema for data is available
	const blockAssets = block.assets.map(asset => codec.decode(blockAssetSchema, asset));

	const blockTransactions = block.transactions.map(tx => decodeTransaction(tx));

	const decodedBlock = {
		header: blockHeader,
		assets: blockAssets,
		transactions: blockTransactions,
	};
	return decodedBlock;
};

const decodeResponse = (endpoint, response) => {
	if (['app_getBlockByHeight', 'app_getBlockByID', 'app_getLastBlock'].includes(endpoint)) {
		const decodedBlock = decodeBlock(response);
		return parseToJSONCompatObj(decodedBlock);
	}

	if (['app_getBlocksByHeightBetween', 'app_getBlocksByIDs'].includes(endpoint)) {
		return response.map(block => {
			const decodedBlock = decodeBlock(block);
			return parseToJSONCompatObj(decodedBlock);
		});
	}

	if (['app_getTransactionByID'].includes(endpoint)) {
		const decodedTransaction = decodeTransaction(response);
		return parseToJSONCompatObj(decodedTransaction);
	}

	if (['getTransactionsByIDs', 'getTransactionsFromPool'].includes(endpoint)) {
		return response.map(transaction => {
			const decodedTransaction = decodeTransaction(transaction);
			return parseToJSONCompatObj(decodedTransaction);
		});
	}
	return response;
};

const decodeSubscriptionEventPayload = (eventName, payload) => {
	if (['app_newBlock', 'app_deleteBlock', 'app_chainForked'].includes(eventName)) {
		const decodedBlock = decodeBlock(payload.block);
		return parseToJSONCompatObj(decodedBlock);
	}

	if (eventName === 'app_newTransaction') {
		const decodedTransaction = decodeTransaction(payload.transaction);
		return parseToJSONCompatObj(decodedTransaction);
	}

	return payload;
};

const decodeEventPayload = async (event, schema) => {
	const decodedEvent = event && schema && event.data !== ''
		? await codec.decode(schema, event.data) : '';

	return {
		...event,
		data: decodedEvent,
	};
};

module.exports = {
	decodeBlock,
	decodeTransaction,
	decodeResponse,
	decodeSubscriptionEventPayload,
	decodeEventPayload,
};
