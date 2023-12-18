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
const { Logger, Signals, CacheRedis } = require('lisk-service-framework');
const { createWSClient, createIPCClient } = require('@liskhq/lisk-api-client');

const config = require('../../config');
const delay = require('../utils/delay');

const logger = Logger();

// Constants
const timeoutMessage = 'Response not received in';
const liskAddress = config.endpoints.liskWs;
const NUM_REQUEST_RETRIES = config.apiClient.request.maxRetries;
const ENDPOINT_INVOKE_RETRY_DELAY = config.apiClient.request.retryDelay;
const CLIENT_ALIVE_ASSUMPTION_TIME = config.apiClient.aliveAssumptionTime;
const HEARTBEAT_ACK_MAX_WAIT_TIME = config.apiClient.heartbeatAckMaxWaitTime;
const CACHED_CLIENT_COUNT = 5;

// Pool of cached api clients
const cachedApiClients = [];

// TODO: Remove this variable and cache usage and docker compose variable. Used to get an idea about the total number of time api client connection is created
const redisCache = CacheRedis(
	'temp',
	process.env.SERVICE_CONNECTOR_CACHE_REDIS || 'redis://lisk:password@127.0.0.1:6381/2',
);
const TOTAL_CLIENT_INITIALIZATION_COUNT = 'totalClientInitializationCount';

const checkIsClientAlive = async clientCache =>
	// eslint-disable-next-line consistent-return
	new Promise(resolve => {
		if (!clientCache || !clientCache._channel || !clientCache._channel.isAlive) {
			return resolve(false);
		}

		// Skip heartbeat check for IPC client
		if (config.isUseLiskIPCClient) {
			return resolve(true);
		}

		const heartbeatCheckBeginTime = Date.now();
		const wsInstance = clientCache._channel._ws;

		// eslint-disable-next-line no-use-before-define
		const boundPongListener = () => pongListener(resolve);
		wsInstance.on('pong', boundPongListener);
		wsInstance.ping(() => {});

		// eslint-disable-next-line consistent-return
		const timeout = setTimeout(() => {
			wsInstance.removeListener('pong', boundPongListener);
			// TODO: Downlevel log to debug
			logger.info(
				`Did not receive API client pong after ${Date.now() - heartbeatCheckBeginTime}ms.`,
			);
			return resolve(false);
		}, HEARTBEAT_ACK_MAX_WAIT_TIME);

		const pongListener = res => {
			clearTimeout(timeout);
			wsInstance.removeListener('pong', boundPongListener);
			// TODO: Downlevel log to debug
			logger.info(`Received API client pong in ${Date.now() - heartbeatCheckBeginTime}ms.`);
			return res(true);
		};
	}).catch(() => false);

const instantiateAndCacheClient = async () => {
	if (cachedApiClients.length > CACHED_CLIENT_COUNT) {
		// TODO: Down level log to debug
		logger.info(
			`Skipping API client instantiation as cached API client count(${cachedApiClients.length}) is greater than CACHED_CLIENT_COUNT(${CACHED_CLIENT_COUNT}).`,
		);
		return;
	}

	try {
		const instantiationBeginTime = Date.now();
		const clientCache = config.isUseLiskIPCClient
			? await createIPCClient(config.liskAppDataPath)
			: await createWSClient(`${liskAddress}/rpc-ws`);

		cachedApiClients.push(clientCache);

		await redisCache.set(
			TOTAL_CLIENT_INITIALIZATION_COUNT,
			((await redisCache.get(TOTAL_CLIENT_INITIALIZATION_COUNT)) || 0) + 1,
		);

		logger.info(
			`Instantiated another API client. Time taken: ${
				Date.now() - instantiationBeginTime
			}ms. Cached API client count:${cachedApiClients.length}`,
		);
	} catch (err) {
		// Nullify the apiClient cache and unset isInstantiating, so that it can be re-instantiated properly
		const errMessage = config.isUseLiskIPCClient
			? `Error instantiating IPC client at ${config.liskAppDataPath}.`
			: `Error instantiating WS client to ${liskAddress}.`;

		logger.error(errMessage);
		logger.error(err.message);
		if (err.message.includes('ECONNREFUSED')) {
			throw new Error('ECONNREFUSED: Unable to reach a network node.');
		}
	}
};

const getApiClient = async () => {
	if (cachedApiClients.length === 0) {
		throw new Error(`No api client is alive!`);
	}
	return cachedApiClients[0];
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

const refreshClientsCache = async () => {
	// Indicates if an active client was destroyed or no active clients available
	let activeClientNotAvailable = cachedApiClients.length === 0;

	// Check liveliness and remove non-responsive clients
	let index = 0;
	while (index < cachedApiClients.length) {
		const cachedClient = cachedApiClients[index];
		try {
			if (!(await checkIsClientAlive(cachedClient))) {
				cachedApiClients.splice(index, 1);
				if (index === 0) {
					activeClientNotAvailable = true;
				}
				cachedClient.disconnect().catch(err => {
					logger.warn(`Client disconnection failed due to: ${err.message}`);
				});
			} else {
				index++;
			}
		} catch (err) {
			logger.info(`Failed to check client aliveness.\nError:${err.message}`);
		}
	}

	// Initiate new clients if necessary
	let missingClientCount = CACHED_CLIENT_COUNT - cachedApiClients.length;

	while (missingClientCount-- > 0) {
		try {
			await instantiateAndCacheClient();
		} catch (err) {
			logger.info(`Failed to instantiate new api client.\nError:${err.message}`);
		}
	}

	// Reset event listeners if active api client was destroyed
	if (activeClientNotAvailable && cachedApiClients.length > 0) {
		Signals.get('newApiClient').dispatch();
	}
};

// Checks to ensure that the API Client is always alive
if (config.isUseLiskIPCClient) {
	const resetApiClientListener = async () => instantiateAndCacheClient().catch(() => {});
	Signals.get('resetApiClient').add(resetApiClientListener);
}

// Check periodically for client aliveness and refill cached clients pool
// TODO: Remove all console.time
(async () => {
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const cacheRefreshStartTime = Date.now();
		await refreshClientsCache();
		// TODO: Down level the log to debug
		logger.info(
			`Refreshed api client cached in ${
				Date.now() - cacheRefreshStartTime
			}ms. API client instantiated ${await redisCache.get(
				TOTAL_CLIENT_INITIALIZATION_COUNT,
			)} time(s) so far.`,
		);
		await delay(CLIENT_ALIVE_ASSUMPTION_TIME);
	}
})();

module.exports = {
	timeoutMessage,

	getApiClient,
	invokeEndpoint,
};
