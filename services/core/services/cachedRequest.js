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

const request = require('request-promise-native');
const cache = require('./cacheMemory');

const cachedRequest = async (url, {
	requestLib = request, expireMiliseconds, requestParams,
} = {}) => {
	let response;
	const key = url + (requestParams ? JSON.stringify(requestParams) : '');
	response = await cache.get(key);
	if (!response) {
		response = await requestLib(url, requestParams);
		cache.set(key, response, expireMiliseconds);
	}
	return response;
};

module.exports = {
	cachedRequest,
};
