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
const { getRegisteredEvents } = require('./endpoints');
const { getApiClient } = require('./client');

const Signals = require('../signals');

const subscribeToAllRegisteredEvents = async () => {
	const apiClient = await getApiClient();
	const registeredEvents = await getRegisteredEvents();

	registeredEvents.forEach(event => {
		apiClient.subscribe(
			event,
			payload => Signals.get(event).dispatch(payload),
		);
	});
};

module.exports = { subscribeToAllRegisteredEvents };
