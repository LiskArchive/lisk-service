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
const { hash } = require('@liskhq/lisk-cryptography');

const { requestConnector } = require('./request');

let eventSchema;

const decodeEvent = async (event) => {
	if (!eventSchema) {
		const schemas = await requestConnector('getSchema');
		eventSchema = schemas.event;
	}
	const eventID = codec.decode(eventSchema, event);
	return eventID;
};

const encodeEvent = async (event) => {
	if (!eventSchema) {
		const schemas = await requestConnector('getSchema');
		eventSchema = schemas.event;
	}
	const eventID = codec.encode(eventSchema, event);
	return eventID;
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
	decodeEvent,
	encodeEvent,
	getEventsInfoToIndex,
};
