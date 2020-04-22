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

let cache = new Keyv();

const configure = (config) => {
	if (config.endpoints && config.endpoints.redis) {
		cache = new Keyv(config.endpoints.redis);
	}
};

const set = (key, val, ttl) => cache.set(key, val, ttl);
const get = key => cache.get(key);

module.exports = {
	configure,
	set,
	get,
	delete: key => cache.delete(key),
};
