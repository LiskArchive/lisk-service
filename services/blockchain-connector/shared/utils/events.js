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
	utils: { hash },
} = require('@liskhq/lisk-cryptography');
const { encodeEvent } = require('../sdk/encoder');

const { getSystemMetadata } = require('../sdk/endpoints');

const getEventID = async (event) => {
	const encodedEvent = (await encodeEvent(event)).toString('hex');
	const eventID = hash(encodedEvent, 'hex').toString('hex');

	return eventID;
};

const getEventSchemaFromName = async (eventName) => {
	const metadata = await getSystemMetadata();

	for (let i = 0; i < metadata.modules.length; i++) {
		const module = metadata.modules[i];

		for (let eventIndex = 0; eventIndex < module.events.length; eventIndex++) {
			const moduleEvent = module.events[eventIndex];
			if (moduleEvent.name === eventName) return module.events[eventIndex].data;
		}
	}

	return null;
};

module.exports = { getEventID, getEventSchemaFromName };
