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
const { Logger } = require('lisk-service-framework');
const { createWSClient } = require('@liskhq/lisk-api-client');

const Signals = require('../../../signals');
const waitForIt = require('../../../waitForIt');
const config = require('../../../../config');

const logger = Logger();

const liskAddress = config.endpoints.liskWs;
const MAX_INSTANTIATION_WAIT_TIME = 500;

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

				// Inform listeners about the newly created ApiClient
				logger.debug(`============== 'newApiClient' signal: ${Signals.get('newApiClient')} ==============`);
				Signals.get('newApiClient').dispatch();
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

const RETRY_INTERVAL = 100; // ms

const getApiClient = async () => {
	const apiClient = await waitForIt(instantiateClient, RETRY_INTERVAL);
	return (apiClient && apiClient._channel && apiClient._channel.invoke)
		? apiClient
		: getApiClient();
};

module.exports = {
	getApiClient,
};
