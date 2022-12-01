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
const { CacheRedis } = require('lisk-service-framework');
const config = require('../../config');

const delegatesCache = CacheRedis('delegates', config.endpoints.cache);

const getNameByAddress = async (address) => {
	if (address) {
		const name = await delegatesCache.get(address);
		if (name) return name;
	}
	return null;
};

const getAddressByName = async (name) => {
	if (name) {
		const address = await delegatesCache.get(name);
		if (address) return address;
	}
	return null;
};

module.exports = {
	getNameByAddress,
	getAddressByName,
};
