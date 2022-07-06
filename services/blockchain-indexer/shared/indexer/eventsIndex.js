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
const { codec } = require('@liskhq/lisk-codec');

const { requestConnector } = require('../utils/request');
const { parseToJSONCompatObj } = require('../utils/parser');

const encodeEvent = async (event) => {
	const schemas = await requestConnector('getSchema');
	const eventID = codec.encode(schemas.event, event);
	return eventID;
};

const getEventsByHeight = async (height) => {
	const events = await requestConnector('chain_getEvents', { height });
	return parseToJSONCompatObj(events);
};

const getEventsIndexInfo = async (blockHeader, events) => {
	const eventsInfo = [];
	const eventTopicsInfo = [];

	await BluebirdPromise.map(
		events,
		async (event) => {
			const id = await encodeEvent(event);

			// Resolve event info
			eventsInfo.push({
				id,
				typeID: event.typeID,
				moduleID: event.moduleID,
				height: blockHeader.height,
				index: event.index,
			});

			// Resolve event topics info
			event.topics.forEach(topic => {
				eventTopicsInfo.push({
					id,
					height: blockHeader.height,
					topic,
				});
			});
		},
		{ concurrency: events.length },
	);

	return { eventsInfo, eventTopicsInfo };
};

module.exports = {
	getEventsByHeight,
	getEventsIndexInfo,
};
