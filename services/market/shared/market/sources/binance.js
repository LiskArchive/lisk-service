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

const requestLib = HTTP.request;
const logger = Logger();

const config = require('../../../config.js');

const binanceCache = CacheRedis('binance_prices', config.endpoints.redis);

const apiEndpoint = config.endpoints.binance;

const symbolMap = {
	LSK_BTC: 'LSKBTC',
	LSK_ETH: 'LSKETH',

	BTC_EUR: 'BTCEUR',
	BTC_GBP: 'BTCGBP',
	BTC_RUB: 'BTCRUB',

	ETH_EUR: 'ETHEUR',
	ETH_RUB: 'ETHRUB',
	ETH_GBP: 'ETHGBP',

	USDT_RUB: 'USDTRUB',

	EUR_USDT: 'EURUSDT',
};

const fetchAllMarketTickers = async () => {
	try {
		const response = await requestLib(`${apiEndpoint}/ticker/price`);
		if (typeof response === 'string') return JSON.parse(response).data;
		return response.data;
	} catch (err) {
		logger.error(err.message);
		logger.error(err.stack);
		return err;
	}
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
			rate: currentTicker.price,
			updateTimestamp: Math.floor(Date.now() / 1000),
			sources: ['binance'],
		};
		return price;
	});
	return transformedPrices;
};

const reloadPricesFromBinance = async () => {
	const tickers = await fetchAllMarketTickers();
	const filteredTickers = filterTickers(tickers);
	const transformedPrices = standardizeTickers(filteredTickers);

	// Serialize individual price item and write to the cache
	await BluebirdPromise.all(transformedPrices
		.map(item => binanceCache.set(`binance_${item.code}`, JSON.stringify(item))));
};

const getBinancePricesFromDB = async () => {
	// Read individual price item from cache and deserialize
	const prices = await BluebirdPromise.map(
		Object.getOwnPropertyNames(symbolMap),
		async (itemCode) => {
			const serializedPrice = await binanceCache.get(`binance_${itemCode}`);
			return JSON.parse(serializedPrice);
		},
		{ concurrency: Object.getOwnPropertyNames(symbolMap).length },
	);
	return prices;
};

module.exports = {
	reloadPricesFromBinance,
	getBinancePricesFromDB,
};
