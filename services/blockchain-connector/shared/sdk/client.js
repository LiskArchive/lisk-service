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
const { Logger, Exceptions: { TimeoutException }, Signals } = require('lisk-service-framework');
const {
	createWSClient,
	createIPCClient,
} = require('@liskhq/lisk-api-client');

const { decodeResponse } = require('./decoder');
const config = require('../../config');
const delay = require('../delay');
const waitForIt = require('../waitForIt');

const logger = Logger();

// Constants
const timeoutMessage = 'Response not received in';
const liskAddress = config.endpoints.liskWs;
const MAX_INSTANTIATION_WAIT_TIME = 100; // in ms
const RETRY_INTERVAL = 500; // ms
const NUM_REQUEST_RETRIES = 5;

// Caching and flags
let clientCache;
let instantiationBeginTime;
let isClientAlive = false;
let isInstantiating = false;

const checkIsClientAlive = async () => {
	await clientCache._channel.invoke('app_getNodeInfo')
		.then(() => { isClientAlive = true; })
		.catch(() => { isClientAlive = false; });

	return isClientAlive;
};

// eslint-disable-next-line consistent-return
const instantiateClient = async () => {
	try {
		if (!isInstantiating) {
			if (!clientCache || !(await checkIsClientAlive())) {
				isInstantiating = true;
				instantiationBeginTime = Date.now();
				if (clientCache) await clientCache.disconnect();

				if (config.isUseLiskIPCClient) {
					clientCache = await createIPCClient(config.liskAppDataPath);
				} else {
					clientCache = await createWSClient(`${liskAddress}/rpc-ws`);
				}

				// Inform listeners about the newly instantiated ApiClient
				Signals.get('newApiClient').dispatch();

				isInstantiating = false;
			}
			return clientCache;
		}

		if ((Date.now() - instantiationBeginTime) > MAX_INSTANTIATION_WAIT_TIME) {
			// Waited too long, reset the flag to re-attempt client instantiation
			isInstantiating = false;
		}
	} catch (err) {
		logger.error(`Error instantiating WS client to ${liskAddress}`);
		logger.error(err.message);
		if (err.code === 'ECONNREFUSED') throw new Error('ECONNREFUSED: Unable to reach a network node');

		return {
			data: { error: 'Action not supported' },
			status: 'METHOD_NOT_ALLOWED',
		};
	}
};

const getApiClient = async () => {
	const apiClient = await waitForIt(instantiateClient, RETRY_INTERVAL);
	return (apiClient && await checkIsClientAlive())
		? apiClient
		: getApiClient();
};

// eslint-disable-next-line consistent-return
const invokeEndpoint = async (endpoint, params = {}, numRetries = NUM_REQUEST_RETRIES) => {
	const apiClient = await getApiClient();
	let retries = numRetries;
	do {
		/* eslint-disable no-await-in-loop */
		try {
			const response = await apiClient._channel.invoke(endpoint, params);
			return response;
		} catch (err) {
			if (retries && err instanceof TimeoutException) await delay(10);
			else throw err;
		}
		/* eslint-enable no-await-in-loop */
	} while (retries--);
};

const invokeEndpointProxy = async (endpoint, params) => {
	const response = await invokeEndpoint(endpoint, params);
	const decodedResponse = decodeResponse(endpoint, response);
	return decodedResponse;
};

module.exports = {
	timeoutMessage,

	getApiClient,
	invokeEndpoint,
	invokeEndpointProxy,
};
