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
const util = require('util');

const {
	Exceptions: { TimeoutException },
	Logger,
	Signals,
} = require('lisk-service-framework');

const { getApiClient, invokeEndpoint, timeoutMessage } = require('./client');
const { getRegisteredEvents } = require('./endpoints');
const { decodeEvent } = require('./decoder');

const logger = Logger();

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
			payload => {
				logger.debug(`Received event: ${event} with payload:\n${util.inspect(payload)}`);
				Signals.get(event).dispatch(payload);
			},
		);
		logger.info(`Subscribed to the API client event: ${event}`);
	});
};

const getEventsByHeight = async (height) => {
	try {
		const chainEvents = await invokeEndpoint('chain_getEvents', { height });
		const decodedEvents = chainEvents.map((event) => decodeEvent(event));
		return decodedEvents;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'chain_getEvents\'');
		}
		throw err;
	}
};

module.exports = {
	subscribeToAllRegisteredEvents,
	events,
	getEventsByHeight,
};
