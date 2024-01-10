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

const config = require('../../config');

const { getApiClient } = require('./client');
const { formatEvent } = require('./formatter');
const {
	getRegisteredEvents,
	getEventsByHeight,
	getNodeInfo,
	getBlockByHeight,
	getBFTParameters,
} = require('./endpoints');
const { updateTokenInfo } = require('./token');
const { getPosConstants } = require('./pos');

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

let eventSubscribeClientPoolIndex;
let eventsCounter;
let lastBlockHeightEvent;

const logError = (method, err) => {
	logger.warn(`Invocation for ${method} failed with error: ${err.message}`);
	logger.debug(err.stack);
};

const emitEngineEvents = async () => {
	getNodeInfo().then(async nodeInfo => {
		const { roundLength } = await getPosConstants();
		const blockTime = (nodeInfo && nodeInfo.genesis && nodeInfo.genesis.blockTime) || 10;

		setInterval(async () => {
			const latestNodeInfo = await getNodeInfo(true);
			const { syncing, height, genesisHeight } = latestNodeInfo;
			const isNodeSyncComplete = !syncing;

			if (isNodeSyncComplete) {
				if (!lastBlockHeightEvent || height > lastBlockHeightEvent) {
					lastBlockHeightEvent = height;
					const newBlock = await getBlockByHeight(height);
					Signals.get(EVENT_CHAIN_BLOCK_NEW).dispatch({ blockHeader: newBlock.header });

					if ((height - genesisHeight) % roundLength === 1) {
						const bftParameters = await getBFTParameters(height);
						Signals.get(EVENT_CHAIN_VALIDATORS_CHANGE).dispatch({
							nextValidators: bftParameters.validators,
							certificateThreshold: bftParameters.certificateThreshold,
							precommitThreshold: bftParameters.precommitThreshold,
						});
					}
				}
			}
		}, Math.min(3, blockTime) * 1000);
	});
};

// eslint-disable-next-line consistent-return
const subscribeToAllRegisteredEvents = async (newClientPoolIndex = null) => {
	if (config.isUseHttpApi) return emitEngineEvents();

	// Active client subscription available, skip invocation
	if (
		typeof eventSubscribeClientPoolIndex === 'number' &&
		eventSubscribeClientPoolIndex !== newClientPoolIndex
	) {
		return null;
	}

	// Reset eventsCounter first
	eventsCounter = 0;

	const apiClient = await getApiClient();
	eventSubscribeClientPoolIndex = apiClient.poolIndex;
	logger.info(`Subscribing events with apiClient ${eventSubscribeClientPoolIndex}.`);

	const registeredEvents = await getRegisteredEvents();
	const allEvents = registeredEvents.concat(events);
	allEvents.forEach(event => {
		apiClient.subscribe(event, async payload => {
			// Force update necessary caches on new chain events
			if (event.startsWith('chain_')) {
				eventsCounter++; // Increase counter with every newBlock/deleteBlock

				await getNodeInfo(true).catch(err => logError('getNodeInfo', err));
				await updateTokenInfo().catch(err => logError('updateTokenInfo', err));
			}

			logger.debug(`Received event: ${event} with payload:\n${util.inspect(payload)}`);
			Signals.get(event).dispatch(payload);
		});
		logger.info(`Subscribed to the API client event: ${event}.`);
	});
};

const getEventsByHeightFormatted = async height => {
	const chainEvents = await getEventsByHeight(height);
	const formattedEvents = chainEvents.map(event => formatEvent(event));
	return formattedEvents;
};

// To ensure API Client is alive and receiving chain events
let isNodeSynced = false;
let isGenesisBlockDownloaded = false;

const ensureAPIClientLiveness = () => {
	if (config.isUseHttpApi) return;

	if (isNodeSynced && isGenesisBlockDownloaded) {
		setInterval(async () => {
			try {
				if (typeof eventsCounter === 'number' && eventsCounter > 0) {
					eventsCounter = 0;
				} else {
					if (typeof eventsCounter !== 'number') {
						logger.warn(
							`eventsCounter ended up with non-numeric value: ${JSON.stringify(
								eventsCounter,
								null,
								'\t',
							)}.`,
						);
						eventsCounter = 0;
					}

					if (typeof eventSubscribeClientPoolIndex === 'number') {
						const apiClient = await getApiClient(eventSubscribeClientPoolIndex);
						Signals.get('resetApiClient').dispatch(apiClient, true);
						logger.debug(
							`Dispatched 'resetApiClient' signal for the event subscription API client ${apiClient.poolIndex}.`,
						);
					} else {
						logger.debug('Triggered subscribeToAllRegisteredEvents from ensureAPIClientLiveness.');
						await subscribeToAllRegisteredEvents();
					}
				}
			} catch (_) {
				// No action required
			}
		}, config.clientConnVerifyInterval);
	} else {
		logger.info(
			`Cannot start the events-based client liveness check yet. Either the node is not yet synced or the genesis block hasn't been downloaded yet.\nisNodeSynced: ${isNodeSynced}, isGenesisBlockDownloaded: ${isGenesisBlockDownloaded}`,
		);
	}
};

const nodeIsSyncedListener = () => {
	logger.debug('Node is now synced with the network.');
	isNodeSynced = true;
	ensureAPIClientLiveness();
};

const genesisBlockDownloadedListener = () => {
	logger.debug('Genesis block is now downloaded.');
	isGenesisBlockDownloaded = true;
	ensureAPIClientLiveness();
};

const eventSubscriptionClientResetListener = () => {
	eventSubscribeClientPoolIndex = null;
};

Signals.get('nodeIsSynced').add(nodeIsSyncedListener);
Signals.get('genesisBlockDownloaded').add(genesisBlockDownloadedListener);
Signals.get('eventSubscriptionClientReset').add(eventSubscriptionClientResetListener);

module.exports = {
	events,

	subscribeToAllRegisteredEvents,
	getEventsByHeight: getEventsByHeightFormatted,
};
