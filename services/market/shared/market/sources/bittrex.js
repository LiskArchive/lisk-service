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
const { HTTP, Logger, CacheRedis } = require('lisk-service-framework');

const BluebirdPromise = require('bluebird');

const config = require('../../../config.js');

const requestLib = HTTP.request;
const logger = Logger();

const apiEndpoint = config.endpoints.bittrex;
const expireMiliseconds = config.ttl.bittrex;

const bittrexCache = CacheRedis('bittrex', config.endpoints.redis);

const symbolMap = {
	LSK_BTC: 'LSK-BTC',
	BTC_USD: 'BTC-USD',
	BTC_EUR: 'BTC-EUR',
};

const fetchAllCurrencyConversionRates = async () => {
	try {
		const response = await requestLib(`${apiEndpoint}/markets/tickers`);
		if (typeof response === 'string') return JSON.parse(response).data;
		return response.data;
	} catch (err) {
		logger.error(err.message);
		logger.error(err.stack);
		return err;
	}
};
const filterCurrencyConversionRates = (currencyConversionRates) => {
	const allowedMarketSymbols = Object.values(symbolMap);
	const filteredcurrencyConversionRates = currencyConversionRates
		.filter(convRate => allowedMarketSymbols.includes(convRate.symbol));
	return filteredcurrencyConversionRates;
};

const standardizeCurrencyConversionRates = (rawConversionRates) => {
	const standardizedConversionRates = Object.entries(symbolMap).map(([k, v]) => {
		const [currentConversionRates] = rawConversionRates
			.filter(rawConversionRate => rawConversionRate.symbol === v);
		const [from, to] = k.split('_');
		const price = {
			code: k,
			from,
			to,
			rate: currentConversionRates.lastTradeRate,
			updateTimestamp: Math.floor(Date.now() / 1000),
			sources: ['bittrex'],
		};
		return price;
	});
	return standardizedConversionRates;
};

const getPricesFromBittrex = async () => {
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

const reloadPricesFromBittrex = async () => {
	const conversionRatesFromCache = await getPricesFromBittrex();

	// Check if prices exists in cache
	if (!conversionRatesFromCache) {
		const currencyConversionRates = await fetchAllCurrencyConversionRates();
		const filteredcurrencyConversionRates = filterCurrencyConversionRates(currencyConversionRates);
		const transformedRates = standardizeCurrencyConversionRates(filteredcurrencyConversionRates);

		// Serialize individual price item and write to the cache
		await BluebirdPromise.all(transformedRates
			.map(item => bittrexCache.set(`bittrex_${item.code}`, JSON.stringify(item), expireMiliseconds)));
	}
};

module.exports = {
	reloadPricesFromBittrex,
	getPricesFromBittrex,
};
