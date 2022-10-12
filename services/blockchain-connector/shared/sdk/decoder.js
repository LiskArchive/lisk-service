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
	getDataSchemaByEventName,
	getEventSchema,
} = require('./schema');

const { parseToJSONCompatObj, parseInputBySchema } = require('../utils/parser');

const decodeTransaction = (transaction) => {
	const txSchema = getTransactionSchema();
	const schemaCompliantTransaction = parseInputBySchema(transaction, txSchema);
	const transactionBuffer = codec.encode(txSchema, schemaCompliantTransaction);
	const transactionID = hash(transactionBuffer);
	const transactionSize = transactionBuffer.length;

	// TODO: Fix after SDK fixes the schema for token transfer transaction
	const txParamsSchema = getTransactionParamsSchema(transaction);
	const transactionParams = transaction.module !== 'token' && transaction.command !== 'transfer'
		? codec.decode(txParamsSchema, transaction.params)
		: transaction.params;

	const decodedTransaction = {
		...transaction,
		params: transactionParams,
		size: transactionSize,
		id: transactionID,
	};

	return parseToJSONCompatObj(decodedTransaction);
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
	return parseToJSONCompatObj(decodedBlock);
};

const decodeEvent = (event) => {
	const eventSchema = getEventSchema();
	const schemaCompliantEvent = parseInputBySchema(event, eventSchema);
	const eventBuffer = codec.encode(eventSchema, schemaCompliantEvent);
	const eventID = hash(eventBuffer);

	const eventDataSchema = getDataSchemaByEventName(event.name);
	const eventData = eventDataSchema
		? codec.decode(eventDataSchema, Buffer.from(event.data, 'hex'))
		: event.data;

	const decodedEvent = {
		...event,
		data: eventData,
		id: eventID,
	};
	return parseToJSONCompatObj(decodedEvent);
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

const decodeAPIClientEventPayload = (eventName, payload) => {
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

module.exports = {
	decodeBlock,
	decodeTransaction,
	decodeEvent,
	decodeResponse,
	decodeAPIClientEventPayload,
};
