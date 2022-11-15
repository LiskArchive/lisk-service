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
	MySQL: {
		getTableInstance,
	},
} = require('lisk-service-framework');

const config = require('../../../config');

const blocksIndexSchema = require('../../database/schema/blocks');
const eventsIndexSchema = require('../../database/schema/events');
const eventTopicsIndexSchema = require('../../database/schema/eventTopics');

const { requestConnector } = require('../../utils/request');
const { normalizeRangeParam } = require('../../utils/paramUtils');
const { parseToJSONCompatObj } = require('../../utils/parser');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getBlocksIndex = () => getTableInstance(
	blocksIndexSchema.tableName,
	blocksIndexSchema,
	MYSQL_ENDPOINT,
);
const getEventsIndex = () => getTableInstance(
	eventsIndexSchema.tableName,
	eventsIndexSchema,
	MYSQL_ENDPOINT,
);
const getEventTopicsIndex = () => getTableInstance(
	eventTopicsIndexSchema.tableName,
	eventTopicsIndexSchema,
	MYSQL_ENDPOINT,
);

const eventCache = CacheLRU('events');

const getEventsByHeight = async (height) => {
	const events = await requestConnector('getEventsByHeight', { height });
	return parseToJSONCompatObj(events);
};

const getEventFromCache = async (height) => {
	const event = await eventCache.get(height);
	if (!event) {
		const eventFromNode = await getEventsByHeight(height);
		await eventCache.set(height, JSON.stringify(eventFromNode));
		return eventFromNode;
	}
	return JSON.parse(event);
};

const getEvents = async (params) => {
	const blocksTable = await getBlocksIndex();
	const eventsDB = await getEventsIndex();
	const eventTopicsDB = await getEventTopicsIndex();

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

	if (params.order) {
		const { order, ...remParams } = params;
		params = remParams;
		params.sort = params.sort
			? params.sort.concat(',', order)
			: 'index:asc';
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
		const [block] = await blocksTable.find({ id: blockID }, ['height']);
		if ('height' in params && params.height !== block.height) {
			throw new NotFoundException(`Invalid combination of blockID: ${blockID} and height: ${params.height}`);
		}
		params.height = block.height;
	}

	const total = await eventTopicsDB.count({ ...params, distinct: 'id' });

	const response = await eventTopicsDB.find(
		{ ...params, distinct: 'id' },
		['id'],
	);

	const eventIDs = response.map(entry => entry.id);
	const eventsInfo = await eventsDB.find(
		{ whereIn: { property: 'id', values: eventIDs } },
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
				const eventFromCache = await getEventFromCache(height);
				event = eventFromCache.find(entry => entry.index === index);
			}

			const [{ id, timestamp } = {}] = await blocksTable.find({ height }, ['id', 'timestamp']);

			return parseToJSONCompatObj({
				...event,
				block: { id, height, timestamp },
			});
		},
		{ concurrency: eventsInfo.length },
	);

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
};
