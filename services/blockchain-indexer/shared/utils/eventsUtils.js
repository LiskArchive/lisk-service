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
const {
	MySQL: {
		getTableInstance,
	},
} = require('lisk-service-framework');
const config = require('../../config');

const eventsTableSchema = require('../database/schema/events');
const eventTopicsTableSchema = require('../database/schema/eventTopics');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getEventsTable = () => getTableInstance(
	eventsTableSchema.tableName,
	eventsTableSchema,
	MYSQL_ENDPOINT,
);

const getEventTopicsTable = () => getTableInstance(
	eventTopicsTableSchema.tableName,
	eventTopicsTableSchema,
	MYSQL_ENDPOINT,
);

const getEventsInfoToIndex = async (block, events) => {
	const eventsInfoToIndex = {
		eventsInfo: [],
		eventTopicsInfo: [],
	};

	events.forEach((event) => {
		const eventInfo = {
			id: event.id,
			name: event.name,
			module: event.module,
			height: block.height,
			index: event.index,
		};

		if (!block.isFinal || config.db.isPersistEvents) {
			eventInfo.eventStr = JSON.stringify(event);
		}

		eventsInfoToIndex.eventsInfo.push(eventInfo);

		event.topics.forEach(topic => {
			const eventTopicInfo = {
				tempID: event.id.concat(topic),
				eventID: event.id,
				height: block.height,
				index: event.index,
				timestamp: block.timestamp,
				topic,
			};
			eventsInfoToIndex.eventTopicsInfo.push(eventTopicInfo);
		});
	});

	return eventsInfoToIndex;
};

const deleteEventsTillBlockHeight = async (blockHeight, dbTrx) => {
	if (Number.isNaN(Number(blockHeight))) return;

	const eventsTable = await getEventsTable();
	const eventTopicsTable = await getEventTopicsTable();
	const queryParams = {
		propBetweens: [{
			property: 'height',
			to: blockHeight,
		}],
		limit: 10000,
	};
	await eventTopicsTable.delete(queryParams, dbTrx);
	await eventsTable.delete(queryParams, dbTrx);
};

module.exports = {
	getEventsInfoToIndex,
	deleteEventsTillBlockHeight,
};
