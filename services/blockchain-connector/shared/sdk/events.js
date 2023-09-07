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

const { Logger, Signals } = require('lisk-service-framework');

const { getApiClient } = require('./client');
const { formatEvent } = require('./formatter');
const { getRegisteredEvents, getEventsByHeight, getNodeInfo } = require('./endpoints');
const { updateTokenInfo } = require('./token');

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

const logError = (method, err) => {
	logger.warn(`Invocation for ${method} failed with error: ${err.message}.`);
	logger.debug(err.stack);
};

const subscribeToAllRegisteredEvents = async () => {
	const apiClient = await getApiClient();
	const registeredEvents = await getRegisteredEvents();
	const allEvents = registeredEvents.concat(events);
	allEvents.forEach(event => {
		apiClient.subscribe(
			event,
			async payload => {
				// Force update necessary caches on new chain events
				if (event.startsWith('chain_')) {
					await getNodeInfo(true).catch(err => logError('getNodeInfo', err));
					await updateTokenInfo().catch(err => logError('updateTokenInfo', err));
				}

				logger.debug(`Received event: ${event} with payload:\n${util.inspect(payload)}`);
				Signals.get(event).dispatch(payload);
			},
		);
		logger.info(`Subscribed to the API client event: ${event}.`);
	});
};

const getEventsByHeightFormatted = async (height) => {
	const chainEvents = await getEventsByHeight(height);
	const formattedEvents = chainEvents.map((event) => formatEvent(event));
	return formattedEvents;
};

module.exports = {
	events,

	subscribeToAllRegisteredEvents,
	getEventsByHeight: getEventsByHeightFormatted,
};
