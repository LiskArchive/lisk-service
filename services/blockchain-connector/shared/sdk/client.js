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
	Logger,
	Signals,
	Utils: { waitForIt },
} = require('lisk-service-framework');
const { createWSClient, createIPCClient } = require('@liskhq/lisk-api-client');

const config = require('../../config');
const delay = require('../utils/delay');

const logger = Logger();

// Constants
const timeoutMessage = 'Response not received in';
const liskAddress = config.endpoints.liskWs;
const RETRY_INTERVAL = config.apiClient.instantiation.retryInterval;
const MAX_INSTANTIATION_WAIT_TIME = config.apiClient.instantiation.maxWaitTime;
const NUM_REQUEST_RETRIES = config.apiClient.request.maxRetries;
const ENDPOINT_INVOKE_RETRY_DELAY = config.apiClient.request.retryDelay;
const CLIENT_ALIVE_ASSUMPTION_TIME = config.apiClient.aliveAssumptionTime;
const CLIENT_ALIVE_ASSUMPTION_TIME_BEFORE_GENESIS =
	config.apiClient.aliveAssumptionTimeBeforeGenesis;
const HEARTBEAT_ACK_MAX_WAIT_TIME = config.apiClient.heartbeatAckMaxWaitTime;
const WS_CONNECTION_LIMIT = config.apiClient.wsConnectionLimit;

// Caching and flags
let clientCache;
let instantiationBeginTime;
let lastClientAliveTime;
let heartbeatCheckBeginTime;
let isInstantiating = false;
let isClientAlive = false;
let isGenesisBlockIndexed = false;
let wsConnectionsEstablished = 0;

const pongListener = res => {
	isClientAlive = true;
	lastClientAliveTime = Date.now();
	return res(true);
};

const checkIsClientAlive = async () =>
	// eslint-disable-next-line consistent-return
	new Promise(resolve => {
		if (!clientCache || (clientCache._channel && !clientCache._channel.isAlive)) {
			return resolve(false);
		}

		if (
			config.isUseLiskIPCClient ||
			Date.now() - lastClientAliveTime < CLIENT_ALIVE_ASSUMPTION_TIME ||
			// The below condition ensures that no other pings are sent when there's already a ping sent
			// after the CLIENT_ALIVE_ASSUMPTION_TIME is exceeded
			Date.now() - heartbeatCheckBeginTime < HEARTBEAT_ACK_MAX_WAIT_TIME * 2
		) {
			return resolve(clientCache._channel && clientCache._channel.isAlive);
		}

		heartbeatCheckBeginTime = Date.now();
		const boundPongListener = () => pongListener(resolve);

		const wsInstance = clientCache._channel._ws;
		wsInstance.on('pong', boundPongListener);
		isClientAlive = false;
		wsInstance.ping(() => {});

		// eslint-disable-next-line consistent-return
		const timeout = setTimeout(() => {
			clearTimeout(timeout);
			wsInstance.removeListener('pong', boundPongListener);
			if (!isClientAlive) return resolve(false);
		}, HEARTBEAT_ACK_MAX_WAIT_TIME);
	}).catch(() => false);

// eslint-disable-next-line consistent-return
const instantiateClient = async (isForceReInstantiate = false) => {
	try {
		if (!isInstantiating || isForceReInstantiate) {
			const isNodeClientAlive = await checkIsClientAlive();

			if (!config.isUseLiskIPCClient) {
				if (isNodeClientAlive) {
					wsConnectionsEstablished = 0;
				} else {
					let numRetries = NUM_REQUEST_RETRIES;
					while (wsConnectionsEstablished >= WS_CONNECTION_LIMIT && numRetries--) {
						await delay(MAX_INSTANTIATION_WAIT_TIME);
						if (await checkIsClientAlive()) {
							wsConnectionsEstablished = 0;
							return clientCache;
						}
					}
				}
			}

			isInstantiating = true;
			if (!isNodeClientAlive || isForceReInstantiate) {
				if (!config.isUseLiskIPCClient) wsConnectionsEstablished++;

				instantiationBeginTime = Date.now();

				if (clientCache) {
					clientCache.disconnect().catch(err => {
						// Ensure failed disconnection doesn't impact the re-instantiation
						logger.warn(`Client disconnection failed due to: ${err.message}`);
					});
				}

				clientCache = config.isUseLiskIPCClient
					? await createIPCClient(config.liskAppDataPath)
					: await createWSClient(`${liskAddress}/rpc-ws`);

				lastClientAliveTime = Date.now();

				if (isForceReInstantiate) logger.info('Re-instantiated the API client forcefully.');

				// Inform listeners about the newly instantiated ApiClient
				Signals.get('newApiClient').dispatch();
			}

			isInstantiating = false;
			return clientCache;
		}

		if (Date.now() - instantiationBeginTime > MAX_INSTANTIATION_WAIT_TIME) {
			// Waited too long, reset the flag to re-attempt client instantiation
			logger.debug(
				`MAX_INSTANTIATION_WAIT_TIME of ${MAX_INSTANTIATION_WAIT_TIME}ms has expired. Resetting isInstantiating to false.`,
			);
			isInstantiating = false;
		}
	} catch (err) {
		// Nullify the apiClient cache and unset isInstantiating, so that it can be re-instantiated properly
		clientCache = null;
		isInstantiating = false;

		const errMessage = config.isUseLiskIPCClient
			? `Error instantiating IPC client at ${config.liskAppDataPath}.`
			: `Error instantiating WS client to ${liskAddress}.`;

		logger.error(errMessage);
		logger.error(err.message);
		if (err.message.includes('ECONNREFUSED')) {
			throw new Error('ECONNREFUSED: Unable to reach a network node.');
		}

		return null;
	}
};

const getApiClient = async () => {
	const apiClient = await waitForIt(instantiateClient, RETRY_INTERVAL);
	return (await checkIsClientAlive()) ? apiClient : getApiClient();
};

// eslint-disable-next-line consistent-return
const invokeEndpoint = async (endpoint, params = {}, numRetries = NUM_REQUEST_RETRIES) => {
	let retries = numRetries;
	do {
		try {
			const apiClient = await getApiClient();
			const response = await apiClient._channel.invoke(endpoint, params);
			return response;
		} catch (err) {
			if (retries && err.message.includes(timeoutMessage)) {
				await delay(ENDPOINT_INVOKE_RETRY_DELAY);
			} else {
				throw err;
			}
		}
	} while (retries--);
};

// Checks to ensure that the API Client is always alive
if (config.isUseLiskIPCClient) {
	const resetApiClientListener = async () => instantiateClient(true).catch(() => {});
	Signals.get('resetApiClient').add(resetApiClientListener);
} else {
	let intervalTimeout;
	const triggerRegularClientLivelinessChecks = intervalMs => {
		intervalTimeout = setInterval(async () => {
			const isAlive = await checkIsClientAlive();
			if (!isAlive) instantiateClient(true).catch(() => {});
		}, intervalMs);
	};

	const genesisBlockDownloadedListener = () => {
		triggerRegularClientLivelinessChecks(CLIENT_ALIVE_ASSUMPTION_TIME_BEFORE_GENESIS);
		logger.info(
			`API client heartbeat checks scheduled every ${CLIENT_ALIVE_ASSUMPTION_TIME_BEFORE_GENESIS}ms. The frequency will be set to ${CLIENT_ALIVE_ASSUMPTION_TIME}ms after successful indexing of the genesis block.`,
		);
	};

	const genesisBlockIndexedListener = indexStatus => {
		if (
			!isGenesisBlockIndexed &&
			indexStatus.data &&
			indexStatus.data.genesisHeight <= indexStatus.data.lastIndexedBlockHeight
		) {
			clearInterval(intervalTimeout);
			triggerRegularClientLivelinessChecks(CLIENT_ALIVE_ASSUMPTION_TIME);
			isGenesisBlockIndexed = true;
			logger.info(
				`API client heartbeat checks re-scheduled to run every ${CLIENT_ALIVE_ASSUMPTION_TIME}ms.`,
			);
		}
	};

	Signals.get('genesisBlockDownloaded').add(genesisBlockDownloadedListener);
	Signals.get('updateIndexStatus').add(genesisBlockIndexedListener);
}

module.exports = {
	timeoutMessage,

	getApiClient,
	invokeEndpoint,
};
