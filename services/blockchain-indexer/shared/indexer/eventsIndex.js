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
const { hash } = require('@liskhq/lisk-cryptography');

const { encodeEvent } = require('../utils/eventsUtils');
const { requestConnector } = require('../utils/request');
const { parseToJSONCompatObj } = require('../utils/parser');

const getEventsByHeight = async (height) => {
	const events = await requestConnector('chain_getEvents', { height });
	return parseToJSONCompatObj(events);
};

const getEventsInfoToIndex = async (blockHeader, events) => {
	const eventsInfoToIndex = {
		eventsInfo: [],
		eventTopicsInfo: [],
	};

	await BluebirdPromise.map(
		events,
		async (event) => {
			const id = hash(event);
			const encodedEvent = await encodeEvent(event);

			const eventInfo = {
				id,
				typeID: event.typeID,
				moduleID: event.moduleID,
				height: blockHeader.height,
				index: event.index,
				event: encodedEvent,
			};

			eventsInfoToIndex.eventsInfo.push(eventInfo);

			event.topics.forEach(topic => {
				eventsInfoToIndex.eventTopicsInfo.push({
					id,
					height: blockHeader.height,
					timestamp: blockHeader.timestamp,
					topic,
				});
			});
		},
		{ concurrency: events.length },
	);

	return eventsInfoToIndex;
};

module.exports = {
	getEventsByHeight,
	getEventsInfoToIndex,
};
