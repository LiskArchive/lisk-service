/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const { Utils, CacheRedis, Logger } = require('lisk-service-framework');
const path = require('path');

const config = require('../config');

const cacheRedis = CacheRedis('block_updater', config.endpoints.redis);
const logger = Logger();

const controllers = Utils.requireAllJs(path.resolve(__dirname, '../methods/controllers'));

const MIN_TIMEOUT = 15 * 1000;

const registerUpdater = (config) => {
	if (config.interval < (MIN_TIMEOUT)) {
		logger.warn(`Warning: Updater ${config.id} has a very low update interval ${config.interval} ms, which is below the reasonable minimum (${MIN_TIMEOUT} ms). Please consider increasing it.`);
	}

	setInterval(async () => {
		const result = await controllers[config.controller][config.method](config.params);
		cacheRedis.set(`live:${config.id}`, JSON.stringify(result.data), config.validity);
	}, config.interval);

	logger.info(`Registered updater: ${config.id}`);
};

const registerUpdaters = () => {
	const config = [
		{
			id: 'connected_peers',
			controller: 'peers',
			method: 'getConnectedPeers',
			params: {
				limit: 1,
			},
			interval: 15 * 1000,
			validity: 10,
		},
		{
			id: 'last_blocks',
			controller: 'blocks',
			method: 'getBlocks',
			params: {
				limit: 1,
			},
			interval: 15 * 1000,
			validity: 10,
		},
	];

	config.forEach(registerUpdater);
};

module.exports = registerUpdaters;
