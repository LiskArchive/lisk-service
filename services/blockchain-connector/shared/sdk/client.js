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
	Utils: { waitForIt },
} = require('lisk-service-framework');
const { createWSClient, createIPCClient } = require('@liskhq/lisk-api-client');

const config = require('../../config');
const delay = require('../utils/delay');

const logger = Logger();

// Connection strings
const liskAddressWs = config.endpoints.liskWs;
const liskAddressHttp = config.endpoints.liskHttp;

// Constants
const HTTP_TIMEOUT_STATUS = 'ETIMEDOUT';
const RPC_TIMEOUT_MESSAGE = 'Response not received in';
const TIMEOUT_REGEX_STR = `(?:${HTTP_TIMEOUT_STATUS}|${RPC_TIMEOUT_MESSAGE})`;
const TIMEOUT_REGEX = new RegExp(TIMEOUT_REGEX_STR);

const RETRY_INTERVAL = config.apiClient.instantiation.retryInterval;
const MAX_INSTANTIATION_WAIT_TIME = config.apiClient.instantiation.maxWaitTime;
const NUM_REQUEST_RETRIES = config.apiClient.request.maxRetries;
const ENDPOINT_INVOKE_RETRY_DELAY = config.apiClient.request.retryDelay;
const WS_SERVER_PING_INTERVAL = config.apiClient.wsServerPingInterval;
const WS_SERVER_PING_BUFFER = config.apiClient.pingIntervalBuffer; // In case the server is under stress

// Caching
let clientCache;
let pingTimeout;
let lastPingAt;
let instantiationBeginTime;
let isInstantiating = false;

const pingListener = () => {
	const now = Date.now();
	clearTimeout(pingTimeout);
	logger.trace(`Server ping received at ${now}.`);

	pingTimeout = setTimeout(() => {
		const timeSinceLastPing = now - lastPingAt;
		// Do not reset if the ping was delayed and just received
		if (timeSinceLastPing) {
			logger.warn(`No ping from server in ${timeSinceLastPing}ms (last ping: ${lastPingAt}).`);
			clientCache._channel.isAlive = false;
			Signals.get('resetApiClient').dispatch();
		}
	}, WS_SERVER_PING_INTERVAL + WS_SERVER_PING_BUFFER);

	lastPingAt = now;
};

const checkIsClientAlive = () =>
	clientCache && clientCache._channel && clientCache._channel.isAlive;

// eslint-disable-next-line consistent-return
const instantiateClient = async (isForceReInstantiate = false) => {
	try {
		if (!isInstantiating || isForceReInstantiate) {
			if (!checkIsClientAlive() || isForceReInstantiate) {
				isInstantiating = true;
				instantiationBeginTime = Date.now();
				if (clientCache) await clientCache.disconnect();

				clientCache = config.isUseLiskIPCClient
					? await createIPCClient(config.liskAppDataPath)
					: await (async () => {
							const client = await createWSClient(`${liskAddressWs}/rpc-ws`);
							client._channel._ws.on('ping', pingListener);
							return client;
					  })();

				if (isForceReInstantiate) logger.info('Re-instantiated the API client forcefully.');

				// Inform listeners about the newly instantiated ApiClient
				Signals.get('newApiClient').dispatch();

				isInstantiating = false;
			}
			return clientCache;
		}

		if (Date.now() - instantiationBeginTime > MAX_INSTANTIATION_WAIT_TIME) {
			// Waited too long, reset the flag to re-attempt client instantiation
			isInstantiating = false;
		}
	} catch (err) {
		// Nullify the apiClient cache, so that it can be re-instantiated properly
		clientCache = null;

		const errMessage = config.isUseLiskIPCClient
			? `Error instantiating IPC client at ${config.liskAppDataPath}.`
			: `Error instantiating WS client to ${liskAddressWs}.`;

		logger.error(`${errMessage}: ${err.message}`);
		if (err.message.includes('ECONNREFUSED')) {
			throw new Error('ECONNREFUSED: Unable to reach a network node.');
		}

		return null;
	}
};

const getApiClient = async () => {
	const apiClient = await waitForIt(instantiateClient, RETRY_INTERVAL);
	return checkIsClientAlive() ? apiClient : getApiClient();
};

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

let id = 0;
// eslint-disable-next-line consistent-return
const invokeEndpoint = async (endpoint, params = {}, numRetries = NUM_REQUEST_RETRIES) => {
	let retriesLeft = numRetries;
	do {
		try {
			if (config.isUseHttpApi) {
				// HTTP API-based communication with the Lisk app node
				const rpcRequest = {
					jsonrpc: '2.0',
					id: id++,
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
						? `Invocation timed out for '${endpoint}'.`
						: `Invocation timed out for '${endpoint}' with params:\n${JSON.stringify(params)}.`;

					throw new TimeoutException(exceptionMsg);
				}
				await delay(ENDPOINT_INVOKE_RETRY_DELAY);
			} else {
				logger.warn(
					Object.getOwnPropertyNames(params).length === 0
						? `Error invoking '${endpoint}':\n${err.stack}`
						: `Error invoking '${endpoint}' with params:\n${JSON.stringify(params)}.\n${err.stack}`,
				);

				throw err;
			}
		}
	} while (retriesLeft--);
};

const resetApiClientListener = async () => instantiateClient(true);
Signals.get('resetApiClient').add(resetApiClientListener);

module.exports = {
	TIMEOUT_REGEX,

	getApiClient,
	invokeEndpoint,
};
