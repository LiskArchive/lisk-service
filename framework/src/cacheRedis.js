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
const Keyv = require('keyv');

const connectionPool = {};

const keyvRedisCache = (endpoint) => {
	if (!connectionPool[endpoint]) {
		connectionPool[endpoint] = new Keyv(endpoint);
	}

	const cache = connectionPool[endpoint];

	return {
		set: (key, val, ttl) => cache.set(key, val, ttl),
		get: key => cache.get(key),
		delete: key => cache.delete(key),
	};
};

module.exports = keyvRedisCache;
