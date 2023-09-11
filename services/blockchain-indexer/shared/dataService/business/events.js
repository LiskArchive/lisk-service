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
const BluebirdPromise = require('bluebird');

const {
	CacheLRU,
	Exceptions: { NotFoundException },
	DB: {
		MySQL: {
			getTableInstance,
		},
	},
} = require('lisk-service-framework');

const config = require('../../../config');

const blocksTableSchema = require('../../database/schema/blocks');
const eventsTableSchema = require('../../database/schema/events');
const eventTopicsTableSchema = require('../../database/schema/eventTopics');

const { requestConnector } = require('../../utils/request');
const { normalizeRangeParam } = require('../../utils/param');
const { parseToJSONCompatObj } = require('../../utils/parser');

const MYSQL_ENDPOINT = config.endpoints.mysqlReplica;

const getBlocksTable = () => getTableInstance(blocksTableSchema, MYSQL_ENDPOINT);
const getEventsTable = () => getTableInstance(eventsTableSchema, MYSQL_ENDPOINT);
const getEventTopicsTable = () => getTableInstance(eventTopicsTableSchema, MYSQL_ENDPOINT);

const eventCache = CacheLRU('events');
const eventCacheByBlockID = CacheLRU('eventsByBlockID');

const getEventsByHeightFromNode = async (height) => {
	const events = await requestConnector('getEventsByHeight', { height });
	return parseToJSONCompatObj(events);
};

const getEventsByHeight = async (height) => {
	// Get from cache
	const cachedEvents = await eventCache.get(height);
	if (cachedEvents) return JSON.parse(cachedEvents);

	// Get from DB only when isPersistEvents is enabled
	if (config.isPersistEvents) {
		const eventsTable = await getEventsTable();
		const dbEventStrings = await eventsTable.find({ height }, ['eventStr']);

		if (dbEventStrings.length) {
			const dbEvents = dbEventStrings
				.map(({ eventStr }) => eventStr ? JSON.parse(eventStr) : eventStr);
			await eventCache.set(height, JSON.stringify(dbEvents));
			return dbEvents;
		}
	}

	// Get from node
	const eventsFromNode = await getEventsByHeightFromNode(height);
	await eventCache.set(height, JSON.stringify(eventsFromNode));
	return eventsFromNode;
};

const getEventsByBlockID = async (blockID) => {
	// Get from cache
	const cachedEvents = await eventCacheByBlockID.get(blockID);
	if (cachedEvents) return JSON.parse(cachedEvents);

	// Get from DB incase of cache miss
	const eventsTable = await getEventsTable();
	const dbEventStrings = await eventsTable.find({ blockID }, ['eventStr']);

	if (dbEventStrings.length) {
		const dbEvents = dbEventStrings
			.map(({ eventStr }) => eventStr ? JSON.parse(eventStr) : eventStr);
		eventCacheByBlockID.set(blockID, JSON.stringify(dbEvents));
		return dbEvents;
	}

	return [];
};

const cacheEventsByBlockID = async (blockID, events) => {
	await eventCacheByBlockID.set(blockID, JSON.stringify(events));
};

const deleteEventsFromCache = async (height) => eventCache.delete(height);

const getEvents = async (params) => {
	const blocksTable = await getBlocksTable();
	const eventsTable = await getEventsTable();
	const eventTopicsTable = await getEventTopicsTable();

	const events = {
		data: [],
		meta: {},
	};

	const isTopicInQuery = !!params.topic;

	if (params.height && typeof params.height === 'string' && params.height.includes(':')) {
		params = normalizeRangeParam(params, 'height');
	}

	if (params.timestamp && params.timestamp.includes(':')) {
		params = normalizeRangeParam(params, 'timestamp');
	}

	if (params.topic) {
		const { topic, ...remParams } = params;
		params = remParams;
		params.whereIn = {
			property: 'topic',
			values: topic.split(','),
		};
	}

	if (params.transactionID) {
		const { transactionID, topic, ...remParams } = params;
		params = remParams;
		if (!topic) {
			params.topic = transactionID;
		} else {
			params.andWhere = { topic: transactionID };
		}
	}

	if (params.senderAddress) {
		const { senderAddress, topic, ...remParams } = params;
		params = remParams;
		if (!topic) {
			params.topic = senderAddress;
		} else {
			params.andWhere = { topic: senderAddress };
		}
	}

	if (params.blockID) {
		const { blockID, ...remParams } = params;
		params = remParams;
		const [block] = await blocksTable.find({ id: blockID, limit: 1 }, ['height']);
		if (!block || !block.height) {
			throw new NotFoundException(`Invalid blockID: ${blockID}`);
		}
		if ('height' in params && params.height !== block.height) {
			throw new NotFoundException(`Invalid combination of blockID: ${blockID} and height: ${params.height}`);
		}
		params.height = block.height;
	}

	params.leftOuterJoin = {
		targetTable: eventsTableSchema.tableName,
		leftColumn: `${eventsTableSchema.tableName}.id`,
		rightColumn: `${eventTopicsTableSchema.tableName}.eventID`,
	};

	const eventsInfo = await eventTopicsTable.find(
		{ ...params, distinct: 'eventID' },
		['eventStr', 'height', 'index'],
	);

	events.data = await BluebirdPromise.map(
		eventsInfo,
		async ({ eventStr, height, index }) => {
			let event;
			if (config.db.isPersistEvents) {
				if (eventStr) event = JSON.parse(eventStr);
			}
			if (!event) {
				const eventsFromCache = await getEventsByHeight(height);
				event = eventsFromCache.find(entry => entry.index === index);
			}

			const [{ id, timestamp } = {}] = await blocksTable.find({ height, limit: 1 }, ['id', 'timestamp']);

			return parseToJSONCompatObj({
				...event,
				block: { id, height, timestamp },
			});
		},
		{ concurrency: eventsInfo.length },
	);

	let total;
	const { order, sort, ...remParams } = params;

	if (isTopicInQuery) {
		total = await eventTopicsTable.count(
			{ ...remParams, groupBy: 'eventID' },
			['eventID'],
		);
	} else {
		// If params dosent contain event_topics specific column data
		// then count all rows of event table for query optimization.
		const { leftOuterJoin, ...remParamsWithoutJoin } = remParams;
		total = await eventsTable.count(remParamsWithoutJoin, ['id']);
	}

	events.meta = {
		count: events.data.length,
		offset: params.offset,
		total,
	};

	return events;
};

module.exports = {
	getEvents,
	getEventsByHeight,
	cacheEventsByBlockID,
	getEventsByBlockID,
	deleteEventsFromCache,
};
