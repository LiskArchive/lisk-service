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
	Logger,
	DB: {
		MySQL: {
			getTableInstance,
			getDBConnection,
			startDBTransaction,
			commitDBTransaction,
			rollbackDBTransaction,
			KVStore: { getKeyValueTable },
		},
	},
} = require('lisk-service-framework');

const { getGenesisHeight, EVENT, EVENT_TOPIC_PREFIX, LENGTH_ID } = require('../../constants');

const config = require('../../../config');
const eventsTableSchema = require('../../database/schema/events');

const logger = Logger();

const LAST_DELETED_EVENTS_HEIGHT = 'lastDeletedEventsHeight';

const MYSQL_ENDPOINT = config.endpoints.mysql;

const keyValueTable = getKeyValueTable();

const getEventsTable = () => getTableInstance(eventsTableSchema, MYSQL_ENDPOINT);

const getEventsInfoToIndex = (block, events) => {
	const eventsInfoToIndex = {
		eventsInfo: [],
		eventTopicsInfo: [],
	};

	events.forEach((event, eventIndex) => {
		const eventInfo = {
			id: event.id,
			name: event.name,
			module: event.module,
			height: block.height,
			index: event.index,
			blockID: block.id,
			timestamp: block.timestamp,
		};

		// Store whole event when persistence is enabled or block is not finalized yet
		// Storing event of non-finalized block is required to fetch events of a deleted block
		if (!block.isFinal || config.db.isPersistEvents) {
			eventInfo.eventStr = JSON.stringify(event);
		}

		eventsInfoToIndex.eventsInfo.push(eventInfo);

		event.topics.forEach(topic => {
			const eventTopicInfo = {
				eventID: event.id,
				topic,
			};
			eventsInfoToIndex.eventTopicsInfo.push(eventTopicInfo);

			// Add the corresponding transactionID as a topic when not present in the topics list
			// i.e. only when the topic starts with the CCM ID prefix
			// Useful to fetch the relevant events when queried by transactionID
			if (
				topic.startsWith(EVENT_TOPIC_PREFIX.CCM_ID) &&
				topic.length === EVENT_TOPIC_PREFIX.CCM_ID.length + LENGTH_ID
			) {
				const commandExecResultEvent = events
					.slice(eventIndex)
					.find(e => e.name === EVENT.COMMAND_EXECUTION_RESULT);

				const [topicTransactionID] = commandExecResultEvent.topics;

				const transactionID = // Remove the topic prefix from transactionID before indexing
					topicTransactionID.length === EVENT_TOPIC_PREFIX.TX_ID.length + LENGTH_ID
						? topicTransactionID.slice(EVENT_TOPIC_PREFIX.TX_ID.length)
						: topicTransactionID;

				const eventTopicAdditionalInfo = {
					eventID: event.id,
					topic: transactionID,
				};
				eventsInfoToIndex.eventTopicsInfo.push(eventTopicAdditionalInfo);
			}
		});
	});

	return eventsInfoToIndex;
};

const deleteEventStrTillHeight = async toHeight => {
	const eventsTable = await getEventsTable();

	const fromHeight = await keyValueTable.get(LAST_DELETED_EVENTS_HEIGHT);

	const connection = await getDBConnection(MYSQL_ENDPOINT);
	const dbTrx = await startDBTransaction(connection);
	logger.debug(
		`Created new MySQL transaction to delete serialized events until height ${toHeight}.`,
	);

	try {
		const queryParams = {
			propBetweens: [
				{
					property: 'height',
					from: fromHeight ? fromHeight + 1 : await getGenesisHeight(),
					to: toHeight,
				},
			],
		};

		await eventsTable.update({ where: queryParams, updates: { eventStr: null } }, dbTrx);
		await keyValueTable.set(LAST_DELETED_EVENTS_HEIGHT, toHeight, dbTrx);

		await commitDBTransaction(dbTrx);
		logger.debug(
			`Committed MySQL transaction to delete serialized events until height ${toHeight}.`,
		);
	} catch (_) {
		await rollbackDBTransaction(dbTrx);
		logger.debug(
			`Rolled back MySQL transaction to delete serialized events until height ${toHeight}.`,
		);
	}
};

module.exports = {
	getEventsInfoToIndex,
	deleteEventStrTillHeight,
};
