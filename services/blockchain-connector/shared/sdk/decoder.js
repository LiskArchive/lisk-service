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
const { utils: { hash } } = require('@liskhq/lisk-cryptography');
const { computeMinFee } = require('@liskhq/lisk-transactions');

const {
	getBlockAssetDataSchemaByModule,
	getTransactionSchema,
	getTransactionParamsSchema,
	getDataSchemaByEventName,
	getEventSchema,
} = require('./schema');

const { parseToJSONCompatObj, parseInputBySchema } = require('../utils/parser');
const { getLisk32Address } = require('../utils/accountUtils');

const decodeTransaction = (transaction) => {
	const txSchema = getTransactionSchema();
	const schemaCompliantTransaction = parseInputBySchema(transaction, txSchema);
	const transactionBuffer = codec.encode(txSchema, schemaCompliantTransaction);
	const transactionSize = transactionBuffer.length;

	const txParamsSchema = getTransactionParamsSchema(transaction);
	const transactionParams = codec.decode(txParamsSchema, Buffer.from(transaction.params, 'hex'));
	// TODO: Verify if 'computeMinFee' returns correct value
	const transactionMinFee = computeMinFee(schemaCompliantTransaction, txParamsSchema);

	const decodedTransaction = {
		...transaction,
		params: transactionParams,
		size: transactionSize,
		minFee: transactionMinFee,
	};

	return parseToJSONCompatObj(decodedTransaction);
};

const decodeBlock = (block) => {
	const blockHeader = block.header;

	const blockAssets = block.assets.map(asset => {
		const assetModule = asset.module;
		const blockAssetDataSchema = getBlockAssetDataSchemaByModule(assetModule);
		// TODO: Can be made schema compliant dynamically
		const decodedAssetData = blockAssetDataSchema
			? codec.decode(blockAssetDataSchema, Buffer.from(asset.data, 'hex'))
			: asset.data;

		const decodedBlockAsset = {
			module: assetModule,
			data: decodedAssetData,
		};
		return decodedBlockAsset;
	});

	const blockTransactions = block.transactions.map(t => decodeTransaction(t));

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
		: { data: event.data };

	// TODO: Remove after SDK fixes the address format
	if (eventDataSchema) {
		Object.entries(eventDataSchema.properties).forEach(([prop]) => {
			if (prop.endsWith('Address')) {
				eventData[prop] = getLisk32Address(eventData[prop].toString('hex'));
			}
		});
	}

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
