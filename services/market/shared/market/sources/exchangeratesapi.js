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

const apiEndpoint = config.endpoints.exchangeratesapi;
const accessKey = config.access_key.exchangeratesapi;

const currencies = ['EUR', 'USD', 'CHF', 'BTC'];

const symbolMap = {
    EUR_USD: 'EURUSD',
    EUR_CHF: 'EURCHF',
    EUR_BTC: 'EURBTC',
};

const fetchAllMarketTickers = async () => {
    try {
        const allMarketTickers = {};
        await BluebirdPromise.all(
            currencies.map(async (baseCurrency) => {
                const response = await requestLib(`${apiEndpoint}/latest?access_key=${accessKey}&base=${baseCurrency}&symbols=${currencies.join(',')}`);
                if (response) allMarketTickers[baseCurrency] = response.data.rates;
            }),
        );
        return allMarketTickers;
    } catch (err) {
        logger.error(err.message);
        logger.error(err.stack);
        return err;
    }
};

const filterTickers = (tickers) => {
    const [transformedTickers] = Object.entries(tickers)
        .map(([k, v]) => Object.keys(v).map(value => ({ symbol: `${k}_${value}`, price: v[value] })));
    return transformedTickers;
};

const standardizeTickers = (tickers) => {
    const transformedPrices = tickers.map(ticker => {
        const [from, to] = ticker.symbol.split('_');
        const price = {
            code: ticker.symbol,
            from,
            to,
            rate: ticker.price,
            updateTimestamp: Math.floor(Date.now() / 1000),
            sources: ['exchangeratesapi'],
        };
        return price;
    });
    return transformedPrices;
};

const getExchangeratesapiPricesFromDB = async () => {
    // Read individual price item from cache and deserialize
    const prices = await BluebirdPromise.map(
        Object.getOwnPropertyNames(symbolMap),
        async (itemCode) => {
            const serializedPrice = await binanceCache.get(`exchangeratesapi_${itemCode}`);
            if (serializedPrice) return JSON.parse(serializedPrice);
            return serializedPrice;
        },
        { concurrency: Object.getOwnPropertyNames(symbolMap).length },
    );
    return prices;
};

const reloadPricesFromExchangerateapi = async () => {
    const pricesFromCache = await getExchangeratesapiPricesFromDB();

    // Check if prices expired or
    if (pricesFromCache.includes(undefined)) {
        const tickers = await fetchAllMarketTickers();
        const filteredTickers = filterTickers(tickers);
        const transformedPrices = standardizeTickers(filteredTickers);

        // Serialize individual price item and write to the cache
        await BluebirdPromise.all(transformedPrices
            .map(item => binanceCache.set(`exchangeratesapi_${item.code}`, JSON.stringify(item), 24 * 60 * 60)));
    }
};


module.exports = {
    reloadPricesFromExchangerateapi,
    getExchangeratesapiPricesFromDB,
};
