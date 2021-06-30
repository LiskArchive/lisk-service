/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const BluebirdPromise = require('bluebird');

const {
	CacheRedis,
	Exceptions: { ServiceUnavailableException },
} = require('lisk-service-framework');

const config = require('../../config');
const { targetPairs } = require('./priceUpdater');

const pricesCache = CacheRedis('market_prices', config.endpoints.redis);

const getMarketPricesFromCache = async () => {
	const prices = {};
	await BluebirdPromise.map(
		targetPairs,
		async pair => {
			const price = await pricesCache.get(pair);
			if (price) prices[pair] = JSON.parse(price);
		},
		{ concurrency: targetPairs.length },
	);
	return prices;
};

const getMarketPrices = async () => {
	const marketPrices = {
		data: [],
		meta: {},
	};

	const pricesByPairs = await getMarketPricesFromCache();
	Object.values(pricesByPairs).forEach(prices => {
		let price;
		while (!price && prices.length) {
			price = prices.shift();
			marketPrices.data.push(price);
		}
	});

	marketPrices.meta = {
		count: marketPrices.data.length,
	};

	if (!marketPrices.data.length) throw new ServiceUnavailableException('Service is not ready yet');

	return marketPrices;
};

module.exports = {
	getMarketPrices,
};
