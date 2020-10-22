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
const coreApi = require('./coreApi');

const {
	...coreApiGetters
} = coreApi;

const coreApiCached = Object.keys(coreApiGetters).reduce((accumulator, key) => ({
	...accumulator,
	[key]: (requestParams, { expireMiliseconds } = {}) => (
		coreApi[key]({
			...requestParams,
			cacheTTL: expireMiliseconds,
		})
	),
}), {});

module.exports = coreApiCached;
