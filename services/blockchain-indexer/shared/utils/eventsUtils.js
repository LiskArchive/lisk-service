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
const {
	utils: { hash },
} = require('@liskhq/lisk-cryptography');

const { requestConnector } = require('./request');

let eventSchema;

const decodeEvent = async (event) => {
	if (!eventSchema) {
		const schemas = await requestConnector('getSchema');
		eventSchema = schemas.event;
	}
	const decodedEvent = codec.decode(eventSchema, Buffer.from(event, 'hex'));
	return decodedEvent;
};

const encodeEvent = async (event) => {
	if (!eventSchema) {
		const schemas = await requestConnector('getSchema');
		eventSchema = schemas.event;
	}

	const schemaCompliantEvent = {
		...event,
		data: Buffer.from(event.data, 'utf8'),
		topics: event.topics.map(t => Buffer.from(t, 'utf8')),
	};

	const encodedEvent = codec.encode(eventSchema, schemaCompliantEvent);
	return encodedEvent;
};

const getEventsInfoToIndex = async (block, events) => {
	const eventsInfoToIndex = {
		eventsInfo: [],
		eventTopicsInfo: [],
	};

	await BluebirdPromise.map(
		events,
		async (event) => {
			const encodedEvent = (await encodeEvent(event)).toString('hex');
			const id = hash(encodedEvent, 'hex').toString('hex');

			const eventInfo = {
				id,
				name: event.name,
				module: event.module,
				height: block.height,
				index: event.index,
				event: encodedEvent,
			};

			eventsInfoToIndex.eventsInfo.push(eventInfo);

			event.topics.forEach(topic => {
				eventsInfoToIndex.eventTopicsInfo.push({
					tempID: id.concat(topic),
					id,
					height: block.height,
					timestamp: block.timestamp,
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
