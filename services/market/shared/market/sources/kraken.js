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
const {
	HTTP,
	CacheRedis,
	Exceptions: { ServiceUnavailableException },
} = require('lisk-service-framework');

const BluebirdPromise = require('bluebird');

const { validateEntries } = require('./common');
const config = require('../../../config.js');

const requestLib = HTTP.request;

const { apiEndpoint, allowRefreshAfter } = config.market.sources.kraken;
const expireMiliseconds = config.ttl.kraken;

const krakenCache = CacheRedis('kraken', config.endpoints.redis);

const symbolMap = {
	LSK_USD: 'LSKUSD',
	LSK_EUR: 'LSKEUR',
	LSK_BTC: 'LSKBTC',
};

const fetchAllMarketTickers = async () => {
	const tradingPairs = Object.values(symbolMap).join(',');
	const response = await requestLib(`${apiEndpoint}/public/Ticker?pair=${tradingPairs}`);
	if (response && response.status === 200) {
		if (typeof response === 'string') return JSON.parse(response).data.result;
		return response.data.result;
	}
	throw new ServiceUnavailableException('Data from Kraken is currently unavailable');
};

const standardizeTickers = (tickers) => {
	const transformedPrices = Object.entries(symbolMap).map(([k, v]) => {
		if (v === symbolMap.LSK_BTC) v = 'LSKXBT'; // Kraken API returns LSKBTC as LSKXBT
		const currentTicker = tickers[v];
		const [from, to] = k.split('_');
		const price = {
			code: k,
			from,
			to,
			rate: currentTicker.c[0],
			updateTimestamp: Math.floor(Date.now() / 1000),
			sources: ['kraken'],
		};
		return price;
	});
	return transformedPrices;
};

const getFromCache = async () => {
	// Read individual price item from cache and deserialize
	const prices = await BluebirdPromise.map(
		Object.getOwnPropertyNames(symbolMap),
		async (itemCode) => {
			const serializedPrice = await krakenCache.get(`kraken_${itemCode}`);
			if (serializedPrice) return JSON.parse(serializedPrice);
			return null;
		},
		{ concurrency: Object.getOwnPropertyNames(symbolMap).length },
	);
	if (prices.includes(null)) return null;
	return prices;
};

const reload = async () => {
	if (validateEntries(await getFromCache(), allowRefreshAfter)) {
		const tickers = await fetchAllMarketTickers();
		if (tickers && Object.getOwnPropertyNames(tickers).length) {
			const transformedPrices = standardizeTickers(tickers);

			// Serialize individual price item and write to the cache
			await BluebirdPromise.all(transformedPrices
				.map(item => krakenCache.set(`kraken_${item.code}`, JSON.stringify(item), expireMiliseconds)));
		}
	}
};

module.exports = {
	reload,
	getFromCache,
};
