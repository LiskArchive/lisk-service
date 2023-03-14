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

const { getFinalizedHeight, getGenesisHeight } = require('../constants');

const keyValueTable = require('../database/mysqlKVStore');
const eventsTableSchema = require('../database/schema/events');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const LAST_DELETED_EVENTS_HEIGHT = 'lastDeletedEventsHeight';

const getEventsTable = () => getTableInstance(
	eventsTableSchema.tableName,
	eventsTableSchema,
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

		// Store whole event when persistence is enabled or block is not finalized yet
		// Storing event of non-finalized block is required to fetch events of a dropped block
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

const deleteEventsTillFinalizedHeight = async () => {
	const eventsTable = await getEventsTable();
	const fromHeight = await keyValueTable.get(LAST_DELETED_EVENTS_HEIGHT);
	const toHeight = await getFinalizedHeight();

	const queryParams = {
		propBetweens: [{
			property: 'height',
			from: fromHeight ? fromHeight + 1 : await getGenesisHeight(),
			to: toHeight,
		}],
	};

	await eventsTable.update({ where: queryParams, updates: { eventStr: null } });
	await keyValueTable.set(LAST_DELETED_EVENTS_HEIGHT, toHeight);
};

module.exports = {
	getEventsInfoToIndex,
	deleteEventsTillFinalizedHeight,
};

module.exports = {
	getEventsInfoToIndex,
	deleteEventsTillFinalizedHeight,
};
