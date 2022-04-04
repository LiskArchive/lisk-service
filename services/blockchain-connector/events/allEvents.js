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
const { getRegisteredEvents } = require('../shared/app/sdk_v5/actions');
const { subscribeToAllRegisteredEvents } = require('../shared/app/sdk_v5/events');

const Signals = require('../shared/utils/signals');

const exportAllEvents = async () => {
	// Re-subscribe to the events when apiClient is re-instantiated
	// Currently throws 'RangeError: Maximum call stack size exceeded'
	await subscribeToAllRegisteredEvents();

	const registeredEvents = await getRegisteredEvents();
	const allMethods = registeredEvents.map(event => {
		const genericController = (regEvent) => (cb) => {
			const eventListener = (payload) => cb(payload);
			Signals.get(regEvent).add(eventListener);
		};
		const controller = genericController(event);

		return {
			name: event,
			description: `Event: ${event}`,
			controller,
		};
	});

	return allMethods;
};

module.exports = exportAllEvents();
