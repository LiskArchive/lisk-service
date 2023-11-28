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
		MySQL: { getTableInstance },
	},
} = require('lisk-service-framework');

const config = require('../../../config');

const blocksTableSchema = require('../../database/schema/blocks');
const eventsTableSchema = require('../../database/schema/events');

const { requestConnector } = require('../../utils/request');
const { normalizeRangeParam } = require('../../utils/param');
const { parseToJSONCompatObj } = require('../../utils/parser');
const { LENGTH_ID, EVENT_TOPIC_PREFIX } = require('../../constants');

const MYSQL_ENDPOINT = config.endpoints.mysqlReplica;

const getBlocksTable = () => getTableInstance(blocksTableSchema, MYSQL_ENDPOINT);
const getEventsTable = () => getTableInstance(eventsTableSchema, MYSQL_ENDPOINT);

const eventCache = CacheLRU('events');
const eventCacheByBlockID = CacheLRU('eventsByBlockID');

const getEventsByHeightFromNode = async height => {
	const events = await requestConnector('getEventsByHeight', { height });
	return parseToJSONCompatObj(events);
};

const getEventsByHeight = async height => {
	// Get from cache
	const cachedEvents = await eventCache.get(height);
	if (cachedEvents) return JSON.parse(cachedEvents);

	// Get from DB only when isPersistEvents is enabled
	if (config.isPersistEvents) {
		const eventsTable = await getEventsTable();
		const dbEventStrings = await eventsTable.find({ height }, ['eventStr']);

		if (dbEventStrings.length) {
			const dbEvents = dbEventStrings.map(({ eventStr }) =>
				eventStr ? JSON.parse(eventStr) : eventStr,
			);
			await eventCache.set(height, JSON.stringify(dbEvents));
			return dbEvents;
		}
	}

	// Get from node
	const eventsFromNode = await getEventsByHeightFromNode(height);
	await eventCache.set(height, JSON.stringify(eventsFromNode));
	return eventsFromNode;
};

const getEventsByBlockID = async blockID => {
	// Get from cache
	const cachedEvents = await eventCacheByBlockID.get(blockID);
	if (cachedEvents) return JSON.parse(cachedEvents);

	// Get from DB incase of cache miss
	const eventsTable = await getEventsTable();
	const dbEventStrings = await eventsTable.find({ blockID }, ['eventStr']);

	if (dbEventStrings.length) {
		const dbEvents = dbEventStrings.map(({ eventStr }) =>
			eventStr ? JSON.parse(eventStr) : eventStr,
		);
		eventCacheByBlockID.set(blockID, JSON.stringify(dbEvents));
		return dbEvents;
	}

	return [];
};

const cacheEventsByBlockID = async (blockID, events) => {
	await eventCacheByBlockID.set(blockID, JSON.stringify(events));
};

const deleteEventsFromCache = async height => eventCache.delete(height);

const deleteEventsFromCacheByBlockID = async blockID => eventCacheByBlockID.delete(blockID);

const getEvents = async params => {
	const blocksTable = await getBlocksTable();
	const eventsTable = await getEventsTable();

	const events = {
		data: [],
		meta: {},
	};

	if (params.height && typeof params.height === 'string' && params.height.includes(':')) {
		params = normalizeRangeParam(params, 'height');
	}

	if (params.timestamp && params.timestamp.includes(':')) {
		params = normalizeRangeParam(params, 'timestamp');
	}

	params.leftOuterJoin = [];
	params.whereIn = [];

	if (params.transactionID) {
		const { transactionID, ...remParams } = params;
		params = remParams;

		const allTxIDs = [transactionID];
		if (transactionID.length === LENGTH_ID) {
			allTxIDs.push(
				EVENT_TOPIC_PREFIX.TX_ID.concat(transactionID),
				EVENT_TOPIC_PREFIX.CCM_ID.concat(transactionID),
			);
		} else if (
			transactionID.startsWith(EVENT_TOPIC_PREFIX.TX_ID) &&
			transactionID.length === EVENT_TOPIC_PREFIX.TX_ID.length + LENGTH_ID
		) {
			// Check for the transaction ID both with and without the topic prefix
			allTxIDs.push(transactionID.slice(EVENT_TOPIC_PREFIX.TX_ID.length));
		} else if (
			transactionID.startsWith(EVENT_TOPIC_PREFIX.CCM_ID) &&
			transactionID.length === EVENT_TOPIC_PREFIX.CCM_ID.length + LENGTH_ID
		) {
			// Check for CCM ID both with and without the topic prefix
			allTxIDs.push(transactionID.slice(EVENT_TOPIC_PREFIX.CCM_ID.length));
		}

		params.leftOuterJoin.push({
			targetTable: `event_topics as eventTopicsForTxID`,
			leftColumn: `events.id`,
			rightColumn: `eventTopicsForTxID.eventID`,
		});

		params.whereIn.push({
			property: 'eventTopicsForTxID.topic',
			values: allTxIDs,
		});
	}

	if (params.senderAddress) {
		const { senderAddress, ...remParams } = params;
		params = remParams;

		params.leftOuterJoin.push({
			targetTable: `event_topics as eventTopicsForSenderAddress`,
			leftColumn: `events.id`,
			rightColumn: `eventTopicsForSenderAddress.eventID`,
		});

		params.whereIn.push({
			property: 'eventTopicsForSenderAddress.topic',
			values: [senderAddress],
		});
	}

	if ('blockID' in params) {
		const { blockID, ...remParams } = params;
		params = remParams;

		const [block] = await blocksTable.find({ id: blockID, limit: 1 }, ['height']);

		if (!block || !block.height) {
			throw new NotFoundException(`Invalid blockID: ${blockID}`);
		}

		if ('height' in params && Number(params.height) !== block.height) {
			let heightLowerBound = Number(params.height);
			let heightHigherBound = Number(params.height);

			if (typeof params.height === 'string' && params.height.includes(':')) {
				const [fromStr, toStr] = params.height.split(':');
				heightLowerBound = Number(fromStr);
				heightHigherBound = Number(toStr);
			}

			if (block.height < heightLowerBound || block.height > heightHigherBound) {
				throw new NotFoundException(
					`Invalid combination of blockID: ${blockID} and height: ${params.height}`,
				);
			}
		}
		params.height = block.height;
	}

	if (params.topic) {
		const { topic, ...remParams } = params;
		params = remParams;

		params.leftOuterJoin.push({
			targetTable: `event_topics as eventTopicsForTopic`,
			leftColumn: `events.id`,
			rightColumn: `eventTopicsForTopic.eventID`,
		});

		params.whereIn.push({
			property: 'eventTopicsForTopic.topic',
			values: [topic],
		});
	}

	const { topic, ...paramsWithoutTopic } = params;
	params = paramsWithoutTopic;
	const eventsInfo = await eventsTable.find(params, ['eventStr', 'height', 'index']);

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

			const [{ id, timestamp } = {}] = await blocksTable.find({ height, limit: 1 }, [
				'id',
				'timestamp',
			]);

			return parseToJSONCompatObj({
				...event,
				block: { id, height, timestamp },
			});
		},
		{ concurrency: eventsInfo.length },
	);

	const { order, sort, ...remParamsWithoutOrderAndSort } = params;
	const total = await eventsTable.count(remParamsWithoutOrderAndSort);

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
	deleteEventsFromCacheByBlockID,
	getEventsByBlockID,
	deleteEventsFromCache,
};
