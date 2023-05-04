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
const { inspect } = require('util');
const { codec } = require('@liskhq/lisk-codec');
const { utils: { hash } } = require('@liskhq/lisk-cryptography');
const { computeMinFee } = require('@liskhq/lisk-transactions');
const { Logger } = require('lisk-service-framework');

const {
	getBlockAssetDataSchemaByModule,
	getTransactionSchema,
	getTransactionParamsSchema,
	getDataSchemaByEventName,
	getEventSchema,
} = require('./schema');

const {
	EVENT_TOPIC_MAPPINGS_BY_MODULE,
	COMMAND_EXECUTION_RESULT_TOPICS,
} = require('./constants/eventTopics');

const { EVENT_NAME_COMMAND_EXECUTION_RESULT } = require('./constants/names');
const { parseToJSONCompatObj, parseInputBySchema } = require('../utils/parser');
const { getLisk32Address } = require('../utils/account');
const { getMinFeePerByte } = require('./fee');

const logger = Logger();

const formatTransaction = (transaction) => {
	// Calculate transaction size
	const txSchema = getTransactionSchema();
	const schemaCompliantTransaction = parseInputBySchema(transaction, txSchema);
	const transactionBuffer = codec.encode(txSchema, schemaCompliantTransaction);
	const transactionSize = transactionBuffer.length;

	// Calculate transaction min fee
	const txParamsSchema = getTransactionParamsSchema(transaction);
	const transactionParams = codec.decodeJSON(txParamsSchema, Buffer.from(transaction.params, 'hex'));

	// TODO: Verify transaction minFee
	const schemaCompliantTransactionParams = codec.decode(txParamsSchema, Buffer.from(transaction.params, 'hex'));
	const nonEmptySignatureCount = transaction.signatures.filter(s => s).length;
	const transactionMinFee = computeMinFee(
		{ ...schemaCompliantTransaction, params: schemaCompliantTransactionParams },
		txParamsSchema,
		{
			minFeePerByte: getMinFeePerByte() || null,
			numberOfSignatures: nonEmptySignatureCount,
			numberOfEmptySignatures: transaction.signatures.length - nonEmptySignatureCount,
		},
	);

	const formattedTransaction = {
		...transaction,
		params: transactionParams,
		size: transactionSize,
		minFee: transactionMinFee,
	};

	return parseToJSONCompatObj(formattedTransaction);
};

const formatBlock = (block) => {
	const blockHeader = block.header;

	const blockAssets = block.assets.map(asset => {
		const assetModule = asset.module;
		const blockAssetDataSchema = getBlockAssetDataSchemaByModule(assetModule);
		const formattedAssetData = blockAssetDataSchema
			? codec.decodeJSON(blockAssetDataSchema, Buffer.from(asset.data, 'hex'))
			: asset.data;

		if (!blockAssetDataSchema) {
			// TODO: Remove this after all asset schemas are exposed (before tagging rc.0)
			console.error(`Block asset schema missing for module ${assetModule}.`);
			logger.error(`Unable to decode asset data. Block asset schema missing for module ${assetModule}.`);
		}

		const formattedBlockAsset = {
			module: assetModule,
			data: formattedAssetData,
		};
		return formattedBlockAsset;
	});

	const blockTransactions = block.transactions.map(t => formatTransaction(t));

	const formattedBlock = {
		header: blockHeader,
		assets: blockAssets,
		transactions: blockTransactions,
	};
	return parseToJSONCompatObj(formattedBlock);
};

const formatEvent = (event, skipDecode) => {
	// Calculate event ID
	const eventSchema = getEventSchema();
	const schemaCompliantEvent = parseInputBySchema(event, eventSchema);
	const eventBuffer = codec.encode(eventSchema, schemaCompliantEvent);
	const eventID = hash(eventBuffer);

	let eventData;
	if (skipDecode) {
		eventData = event.data;
	} else {
		const eventDataSchema = getDataSchemaByEventName(event.name);
		eventData = eventDataSchema
			? codec.decodeJSON(eventDataSchema, Buffer.from(event.data, 'hex'))
			: { data: event.data };

		if (!eventDataSchema) {
			// TODO: Remove this after SDK exposes all event schemas (before tagging rc.0)
			console.error(`Event data schema missing for ${event.module}:${event.name}.`);
			logger.error(`Unable to decode event data. Event data schema missing for ${event.module}:${event.name}.`);
		} else {
			// TODO: Remove after SDK fixes the address format (before tagging rc.0)
			Object.keys(eventDataSchema.properties).forEach((prop) => {
				if (prop.endsWith('Address')) {
					eventData[prop] = getLisk32Address(eventData[prop].toString('hex'));
				}
			});
		}
	}

	const eventTopicMappings = EVENT_TOPIC_MAPPINGS_BY_MODULE[event.module] || {};
	// TODO: Remove after all transaction types are tested (before tagging rc.0)
	if (!(event.module in EVENT_TOPIC_MAPPINGS_BY_MODULE)) {
		console.error(`EVENT_TOPIC_MAPPINGS_BY_MODULE missing for module: ${event.module}.`);
		console.info(inspect(event));
	}

	const topics = event.name === EVENT_NAME_COMMAND_EXECUTION_RESULT
		? COMMAND_EXECUTION_RESULT_TOPICS
		: eventTopicMappings[event.name];

	// TODO: Remove after all transaction types are tested (before tagging rc.0)
	if (!topics || topics.length === 0) {
		console.error(`EVENT_TOPIC_MAPPINGS_BY_MODULE undefined for event: ${event.name}.`);
		console.info(inspect(event));
	} else if (topics.length !== event.topics.length) {
		console.error(`EVENT_TOPIC_MAPPINGS_BY_MODULE defined incorrectly for event: ${event.name}.`);
		console.info(inspect(event));
	}

	let eventTopics;
	if (topics) {
		eventTopics = event.topics.map((topic, index) => {
			const topicAtIndex = topics[index] || '';
			if (topicAtIndex.toLowerCase().endsWith('address') && !topicAtIndex.includes('legacy')) {
				return getLisk32Address(topic);
			}
			return topic;
		});
	} else {
		eventTopics = event.topics;
	}

	const formattedEvent = {
		...event,
		data: eventData,
		topics: eventTopics,
		id: eventID,
	};
	return parseToJSONCompatObj(formattedEvent);
};

const formatResponse = (endpoint, response) => {
	if (['app_getBlockByHeight', 'app_getBlockByID', 'app_getLastBlock'].includes(endpoint)) {
		const formattedBlock = formatBlock(response);
		return parseToJSONCompatObj(formattedBlock);
	}

	if (['app_getBlocksByHeightBetween', 'app_getBlocksByIDs'].includes(endpoint)) {
		return response.map(block => {
			const formattedBlock = formatBlock(block);
			return parseToJSONCompatObj(formattedBlock);
		});
	}

	if (['app_getTransactionByID'].includes(endpoint)) {
		const formattedTransaction = formatTransaction(response);
		return parseToJSONCompatObj(formattedTransaction);
	}

	if (['getTransactionsByIDs', 'getTransactionsFromPool'].includes(endpoint)) {
		return response.map(transaction => {
			const formattedTransaction = formatTransaction(transaction);
			return parseToJSONCompatObj(formattedTransaction);
		});
	}
	return response;
};

const formatAPIClientEventPayload = (eventName, payload) => {
	if (['app_newBlock', 'app_deleteBlock', 'app_chainForked'].includes(eventName)) {
		const formattedBlock = formatBlock(payload.block);
		return parseToJSONCompatObj(formattedBlock);
	}

	if (eventName === 'app_newTransaction') {
		const formattedTransaction = formatTransaction(payload.transaction);
		return parseToJSONCompatObj(formattedTransaction);
	}

	return payload;
};

module.exports = {
	formatBlock,
	formatTransaction,
	formatEvent,
	formatResponse,
	formatAPIClientEventPayload,
};
