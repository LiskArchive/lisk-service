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
	Logger,
	CacheRedis,
	Exceptions: { ServiceUnavailableException },
} = require('lisk-service-framework');

const BluebirdPromise = require('bluebird');

const { validateEntries } = require('./common');
const config = require('../../../config.js');

const requestLib = HTTP.request;
const logger = Logger();

const { apiEndpoint, allowRefreshAfter } = config.market.sources.bittrex;
const expireMiliseconds = config.ttl.bittrex;

const bittrexCache = CacheRedis('bittrex', config.endpoints.redis);

const symbolMap = {
	LSK_BTC: 'LSK-BTC',
	BTC_USD: 'BTC-USD',
	BTC_EUR: 'BTC-EUR',
};

const fetchAllMarketTickers = async () => {
	const response = await requestLib(`${apiEndpoint}/markets/tickers`);
	if (response && response.status === 200) {
		if (typeof response === 'string') return JSON.parse(response).data;
		return response.data;
	}
	throw new ServiceUnavailableException('Data from Bittrex is currently unavailable');
};

const filterTickers = (tickers) => {
	const allowedMarketSymbols = Object.values(symbolMap);
	const filteredTickers = tickers.filter(ticker => allowedMarketSymbols.includes(ticker.symbol));
	return filteredTickers;
};

const standardizeTickers = (tickers) => {
	const transformedPrices = Object.entries(symbolMap).map(([k, v]) => {
		const [currentTicker] = tickers.filter(ticker => ticker.symbol === v);
		const [from, to] = k.split('_');
		const price = {
			code: k,
			from,
			to,
			rate: currentTicker.lastTradeRate,
			updateTimestamp: Math.floor(Date.now() / 1000),
			sources: ['bittrex'],
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
			const serializedPrice = await bittrexCache.get(`bittrex_${itemCode}`);
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
		if (tickers && Array.isArray(tickers)) {
			const filteredTickers = filterTickers(tickers);
			const transformedPrices = standardizeTickers(filteredTickers);

			// Serialize individual price item and write to the cache
			await BluebirdPromise.all(transformedPrices
				.map(item => bittrexCache.set(`bittrex_${item.code}`, JSON.stringify(item), expireMiliseconds)));
		}
	}
};

module.exports = {
	reload,
	getFromCache,
};
