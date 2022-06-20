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
const { Signals } = require('lisk-service-framework');

const { getRegisteredEvents } = require('./endpoints');
const { getApiClient } = require('./client');

// TODO: Update the implementation to avoid any hardcoding with the issue https://github.com/liskhq/lisk-service/issues/1097
const EVENT_CHAIN_FORK = 'chain_forked';
const EVENT_CHAIN_BLOCK_NEW = 'chain_newBlock';
const EVENT_CHAIN_BLOCK_DELETE = 'chain_deleteBlock';
const EVENT_CHAIN_VALIDATORS_CHANGE = 'chain_validatorsChanged';
const EVENT_TX_POOL_TRANSACTION_NEW = 'txpool_newTransaction';

const events = [
	EVENT_CHAIN_FORK,
	EVENT_CHAIN_BLOCK_NEW,
	EVENT_CHAIN_BLOCK_DELETE,
	EVENT_CHAIN_VALIDATORS_CHANGE,
	EVENT_TX_POOL_TRANSACTION_NEW,
];

const subscribeToAllRegisteredEvents = async () => {
	const apiClient = await getApiClient();
	const registeredEvents = await getRegisteredEvents();
	const allEvents = registeredEvents.concat(events);
	allEvents.forEach(event => {
		apiClient.subscribe(
			event,
			payload => Signals.get(event).dispatch(payload),
		);
	});
};

module.exports = { subscribeToAllRegisteredEvents, events };
