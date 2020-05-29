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

const config = require('../config');
const redis = require('redis').createClient(config.endpoints.redis);
const lru = require('redis-lru');

const cacheRedis = lru(redis, config.lruPromiseCacheMaxItems);

const cache = new Map();

const cachedPromise = async ({ method, args, ttl }) => {
	const key = args.map(arg => (
		typeof arg === 'object' ? JSON.stringify(arg) : arg
	)).join('-');

	let response;
	if (ttl) {
		response = await cacheRedis.get(key);
		if (response) {
			return response;
		}
	}

	let promise = cache.get(key);
	if (!promise) {
		promise = method(...args);
		cache.set(key, promise);
	}
	response = await promise;
	cache.delete(key);

	if (ttl) {
		cacheRedis.set(key, response, ttl);
	}

	return response;
};

module.exports = cachedPromise;
