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

const { getApiClient, instantiateClient } = require('./client');
const { formatEvent } = require('./formatter');
const { getRegisteredEvents, getEventsByHeight, getNodeInfo } = require('./endpoints');
const { getEscrowedAmounts } = require('./token');
const config = require('../../config');

const logger = Logger();

const { numOfBlocksReset, numOfBlocksVerify } = config.verifyClientConnection;

const EVENT_CHAIN_FORK = 'chain_forked';
const EVENT_CHAIN_BLOCK_NEW = 'chain_newBlock';
const EVENT_CHAIN_BLOCK_DELETE = 'chain_deleteBlock';
const EVENT_CHAIN_VALIDATORS_CHANGE = 'chain_validatorsChanged';
const EVENT_TX_POOL_TRANSACTION_NEW = 'txpool_newTransaction';
const BLOCK_TIME = 10000; // ms

const events = [
	EVENT_CHAIN_FORK,
	EVENT_CHAIN_BLOCK_NEW,
	EVENT_CHAIN_BLOCK_DELETE,
	EVENT_CHAIN_VALIDATORS_CHANGE,
	EVENT_TX_POOL_TRANSACTION_NEW,
];

let isClientConnected = false;

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
					await getNodeInfo(true)
						.catch(err => logger.warn(`Invocation for 'getNodeInfo' failed with error: ${err.message}.`));
					await getEscrowedAmounts(true)
						.catch(err => logger.warn(`Invocation for 'getEscrowedAmounts' failed with error: ${err.message}.`));
				}

				isClientConnected = true;
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

const verifyClientConnection = async () => {
	setInterval(() => isClientConnected = false, BLOCK_TIME * numOfBlocksReset);
	setInterval(async () => {
		if (!isClientConnected) {
			logger.info('Re-instantiating API client.');
			await instantiateClient(true);
		}
	}, BLOCK_TIME * numOfBlocksVerify);
};

module.exports = {
	events,
	verifyClientConnection,

	subscribeToAllRegisteredEvents,
	getEventsByHeight: getEventsByHeightFormatted,
};
