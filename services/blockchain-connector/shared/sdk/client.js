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
	HTTP,
	Exceptions: { TimeoutException },
	Utils: { delay, isObject, waitForIt },
} = require('lisk-service-framework');
const { createWSClient, createIPCClient } = require('@liskhq/lisk-api-client');

const crypto = require('crypto');

const config = require('../../config');

const logger = Logger();

// Connection strings
const liskAddressWs = config.endpoints.liskWs;
const liskAddressHttp = config.endpoints.liskHttp;

// Constants
const ERROR_CONN_REFUSED = 'ECONNREFUSED';
const STATUS_HTTP_TIMEOUT = 'ETIMEDOUT';
const MESSAGE_RPC_TIMEOUT = 'Response not received in';
const TIMEOUT_REGEX_STR = `(?:${STATUS_HTTP_TIMEOUT}|${MESSAGE_RPC_TIMEOUT})`;
const TIMEOUT_REGEX = new RegExp(TIMEOUT_REGEX_STR);

const MAX_CLIENT_POOL_SIZE = config.apiClient.poolSize;
const NUM_REQUEST_RETRIES = config.apiClient.request.maxRetries;
const ENDPOINT_INVOKE_RETRY_DELAY = config.apiClient.request.retryDelay;
const WS_SERVER_PING_INTERVAL = config.apiClient.wsServerPingInterval;
const WS_SERVER_PING_BUFFER = config.apiClient.pingIntervalBuffer; // In case the server is under stress
const WS_SERVER_PING_THRESHOLD = WS_SERVER_PING_INTERVAL + WS_SERVER_PING_BUFFER;

// Caching
const clientPool = [];
const clientInstantiationStats = {
	attempts: 0,
	success: 0,
	fail: 0,
};
let requestCount = 0;

const checkIsClientAlive = client => client && client._channel && client._channel.isAlive;

const getApiClientStats = () => ({
	...clientInstantiationStats,
	activePoolSize: clientPool.filter(client => checkIsClientAlive(client)).length,
	expectedPoolSize: MAX_CLIENT_POOL_SIZE,
	numEndpointInvocations: requestCount,
});

const pingListener = apiClient => {
	if (!isObject(apiClient)) {
		logger.warn(`apiClient is ${JSON.stringify(apiClient)}. Cannot register a pingListener.`);
		return;
	}

	const now = Date.now();
	logger.trace(`Client ${apiClient.poolIndex} received server ping at ${now}.`);
	clearTimeout(apiClient.pingTimeout);

	apiClient.pingTimeout = setTimeout(() => {
		// Do not reset if the ping was delayed and just received
		const timeSinceLastPing = now - apiClient.lastPingAt;
		if (timeSinceLastPing) {
			logger.warn(
				`No ping for client ${apiClient.poolIndex} from server in ${timeSinceLastPing}ms (last ping: ${apiClient.lastPingAt}).`,
			);
			apiClient._channel.isAlive = false;
			Signals.get('resetApiClient').dispatch(apiClient);
			logger.debug(
				`Dispatched 'resetApiClient' signal from pingListener for API client ${apiClient.poolIndex}.`,
			);
		}
	}, WS_SERVER_PING_THRESHOLD);

	apiClient.lastPingAt = now;
};

const instantiateNewClient = async () => {
	clientInstantiationStats.attempts++;
	try {
		const newClient = config.isUseLiskIPCClient
			? await createIPCClient(config.liskAppDataPath)
			: await (async () => {
					const client = await createWSClient(`${liskAddressWs}/rpc-ws`);
					client._channel._ws.on('ping', pingListener.bind(null, client));
					return client;
			  })();

		clientInstantiationStats.success++;
		return newClient;
	} catch (err) {
		clientInstantiationStats.fail++;
		const errMessage = config.isUseLiskIPCClient
			? `Error instantiating IPC client at ${config.liskAppDataPath}`
			: `Error instantiating WS client to ${liskAddressWs}`;

		logger.error(`${errMessage}: ${err.message}`);
		if (err.message.includes(ERROR_CONN_REFUSED)) {
			throw new Error('Unable to connect to the node.');
		}

		throw err;
	}
};

let isReInstantiateIntervalRunning = false;
const initClientPool = async poolSize => {
	// Set the intervals only at application init
	if (clientPool.length === 0) {
		setInterval(() => {
			const stats = getApiClientStats();
			logger.info(`API client instantiation stats: ${JSON.stringify(stats)}`);
			if (stats.activePoolSize < stats.expectedPoolSize) {
				logger.warn(
					'activePoolSize should catch up with the expectedPoolSize, once the node is under less stress.',
				);
			}
		}, 5 * 60 * 1000);

		// Re-instantiate interval: Replaces nulls in clientPool with new active apiClients
		// isReInstantiateIntervalRunning is the safety check to skip callback execution if the previous one is already in-progress
		setInterval(async () => {
			if (isReInstantiateIntervalRunning) return;
			isReInstantiateIntervalRunning = true;

			for (let index = 0; index < clientPool.length; index++) {
				const apiClient = clientPool[index];

				// eslint-disable-next-line no-continue
				if (isObject(apiClient)) continue;

				// Re-instantiate when null
				const newApiClient = await instantiateNewClient()
					.then(client => {
						client.poolIndex = index;
						return client;
					})
					// Delay to lower stress on the node
					.catch(() => delay(Math.ceil(2 * WS_SERVER_PING_INTERVAL), null));
				clientPool[index] = newApiClient;
				if (newApiClient) Signals.get('newApiClient').dispatch(newApiClient.poolIndex);
			}

			isReInstantiateIntervalRunning = false;
		}, WS_SERVER_PING_INTERVAL);
	}

	try {
		const startTime = Date.now();
		for (let i = 0; i < poolSize; i++) {
			// Do not instantiate new clients if enough clients already cached
			if (clientPool.length >= poolSize) break;

			const newApiClient = await instantiateNewClient();
			newApiClient.poolIndex = clientPool.length;
			clientPool.push(newApiClient);
		}
		logger.info(
			`Initialized client pool in ${Date.now() - startTime}ms with ${clientPool.length} instances.`,
		);
	} catch (err) {
		logger.warn(
			clientPool.length
				? `API client pool initialization failed due to: ${err.message}\nManaged to initialize the pool with only ${clientPool.length} instead of expected ${poolSize} clients.`
				: `API client pool initialization failed due to: ${err.message}`,
		);
		throw err;
	}
};

const getApiClient = async poolIndex => {
	if (!clientPool.length) await initClientPool(MAX_CLIENT_POOL_SIZE);

	const index = Number.isNaN(Number(poolIndex))
		? crypto.randomInt(Math.min(clientPool.length, MAX_CLIENT_POOL_SIZE))
		: poolIndex;

	const apiClient = clientPool[index];
	return checkIsClientAlive(apiClient)
		? apiClient
		: (() => {
				if (apiClient) {
					Signals.get('resetApiClient').dispatch(apiClient);
					logger.debug(
						`Dispatched 'resetApiClient' signal from getApiClient for API client ${apiClient.poolIndex}.`,
					);
				}
				return waitForIt(getApiClient, Math.ceil(WS_SERVER_PING_INTERVAL / MAX_CLIENT_POOL_SIZE));
		  })();
};

const resetApiClient = async (apiClient, isEventSubscriptionClient = false) => {
	// Replace the dead API client in the pool
	if (!isObject(apiClient)) {
		logger.warn(`apiClient is ${JSON.stringify(apiClient)}. Cannot reset.`);
		if (isEventSubscriptionClient) Signals.get('eventSubscriptionClientReset').dispatch();
		return;
	}

	const { poolIndex } = apiClient;

	// Do not attempt reset if last ping was within the acceptable threshold
	// This is to avoid unnecessary socket creation
	if (Date.now() - (apiClient.lastPingAt || 0) < WS_SERVER_PING_THRESHOLD) {
		logger.debug(`Not resetting apiClient ${poolIndex}. Received a late ping from the server.`);
		return;
	}

	if (isEventSubscriptionClient) {
		logger.info(`Attempting to reset the eventSubscriptionClient: apiClient ${poolIndex}.`);
		Signals.get('eventSubscriptionClientReset').dispatch();
	} else {
		logger.info(`Attempting to reset apiClient ${poolIndex}.`);
	}

	await apiClient
		.disconnect()
		.catch(err => logger.warn(`Error disconnecting apiClient: ${err.message}. Will proceed.`));

	const newApiClient = await instantiateNewClient()
		.then(client => {
			client.poolIndex = poolIndex;
			logger.info(`Successfully reset apiClient ${poolIndex}.`);
			return client;
		})
		.catch(() => null);

	clientPool[poolIndex] = newApiClient;

	if (newApiClient) Signals.get('newApiClient').dispatch(newApiClient.poolIndex);
};
Signals.get('resetApiClient').add(resetApiClient);

const is2XXResponse = response => String(response.status).startsWith('2');
const isSuccessResponse = response => is2XXResponse(response) && response.data.result;

const buildHTTPResponse = (endpoint, params, response) => {
	if (isSuccessResponse(response)) return response.data.result;

	const errorMessage =
		response.data && response.data.error
			? response.data.error.message
			: `${response.status}: ${response.message}`;
	logger.trace(
		`Error invoking endpoint '${endpoint}' with params ${JSON.stringify(params)}:\n${errorMessage}`,
	);
	throw new Error(errorMessage);
};

// eslint-disable-next-line consistent-return
const invokeEndpoint = async (endpoint, params = {}, numRetries = NUM_REQUEST_RETRIES) => {
	let retriesLeft = numRetries;
	do {
		try {
			requestCount++;
			if (config.isUseHttpApi) {
				// HTTP API-based communication with the Lisk app node
				const rpcRequest = {
					jsonrpc: '2.0',
					id: requestCount,
					method: endpoint,
					params,
				};

				const response = await HTTP.post(`${liskAddressHttp}/rpc`, rpcRequest);
				return buildHTTPResponse(endpoint, params, response);
			}

			// WS and IPC client-based communication with the Lisk app node
			const apiClient = await getApiClient();
			const response = await apiClient._channel.invoke(endpoint, params);
			return response;
		} catch (err) {
			if (TIMEOUT_REGEX.test(err.message)) {
				if (!retriesLeft) {
					const exceptionMsg = Object.getOwnPropertyNames(params).length
						? `Invocation timed out for '${endpoint}' with params:\n${JSON.stringify(params)}.`
						: `Invocation timed out for '${endpoint}'.`;

					throw new TimeoutException(exceptionMsg);
				}
				await delay(ENDPOINT_INVOKE_RETRY_DELAY);
			} else {
				logger.warn(
					Object.getOwnPropertyNames(params).length
						? `Error invoking '${endpoint}' with params:\n${JSON.stringify(params)}.\n${err.stack}`
						: `Error invoking '${endpoint}'.\n${err.stack}`,
				);

				throw err;
			}
		}
	} while (retriesLeft--);
};

module.exports = {
	TIMEOUT_REGEX,

	getApiClient,
	invokeEndpoint,
};
