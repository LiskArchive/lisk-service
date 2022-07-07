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
const { codec } = require('@liskhq/lisk-codec');
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
module.exports = {
	decodeEvent,
	encodeEvent,
};
