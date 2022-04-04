/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const { Logger, Exceptions: { TimeoutException } } = require('lisk-service-framework');
const { createWSClient } = require('@liskhq/lisk-api-client');

const config = require('../../../config');
const delay = require('../../utils/delay');
const waitForIt = require('../../utils/waitForIt');
const Signals = require('../../utils/signals');

const logger = Logger();

// Constants
const liskAddress = config.endpoints.liskWs;
const MAX_INSTANTIATION_WAIT_TIME = 100; // in ms
const RETRY_INTERVAL = 500; // ms
const NUM_REQUEST_RETRIES = 5;

// Caching and flags
let clientCache;
let instantiationBeginTime;
let isInstantiating = false;

// eslint-disable-next-line consistent-return
const instantiateClient = async () => {
	try {
		if (!isInstantiating) {
			if (!clientCache || !clientCache._channel.isAlive) {
				isInstantiating = true;
				instantiationBeginTime = Date.now();
				if (clientCache) await clientCache.disconnect();
				clientCache = await createWSClient(`${liskAddress}/ws`);
				isInstantiating = false;
			}

			// Inform listeners about the newly created ApiClient
			Signals.get('newApiClient').dispatch();

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
	return (apiClient && apiClient._channel && apiClient._channel.invoke)
		? apiClient
		: getApiClient();
};

// eslint-disable-next-line consistent-return
const invokeAction = async (action, params = {}, numRetries = NUM_REQUEST_RETRIES) => {
	const apiClient = await getApiClient();
	let retries = numRetries;
	do {
		/* eslint-disable no-await-in-loop */
		try {
			const response = await apiClient._channel.invoke(action, params);
			return response;
		} catch (err) {
			if (retries && err instanceof TimeoutException) await delay(10);
			else throw err;
		}
		/* eslint-enable no-await-in-loop */
	} while (retries--);
};

module.exports = {
	getApiClient,
	invokeAction,
};
