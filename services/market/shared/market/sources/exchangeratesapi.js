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
const { symbolMap } = require('./constants/exchangeratesapi.js');

const binanceCache = CacheRedis('binance_prices', config.endpoints.redis);

const apiEndpoint = config.endpoints.exchangeratesapi;
const accessKey = config.access_key.exchangeratesapi;

const basePrices = ['EUR', 'USD', 'GBP', 'CHF', 'BTC', 'RUB', 'JPY'];

const fetchAllMarketTickers = async () => {
    try {
        const allMarketPrices = [];
        await BluebirdPromise.map(
            basePrices,
            async (basePrice) => {
                const response = await requestLib(`${apiEndpoint}/latest?access_key=${accessKey}&base=${basePrice}`);
                if (response) allMarketPrices.push(response.data);
            },
            { concurrency: basePrices.length },
        );

        return allMarketPrices;
    } catch (err) {
        logger.error(err.message);
        logger.error(err.stack);
        return err;
    }
};

const filterTickers = (tickers) => {
    const filteredTickers = [];
    tickers.map(ticker => {
        const transformData = Object.entries(ticker.rates).filter(([k]) => basePrices.includes(k));
        transformData.forEach(acc => filteredTickers.push({ symbol: `${ticker.base}_${acc[0]}`, price: acc[1] }));
        return transformData;
    });
    return filteredTickers;
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

const reloadPricesFromExchangerateapi = async () => {
    const tickers = await fetchAllMarketTickers();
    const filteredTickers = filterTickers(tickers);
    const transformedPrices = standardizeTickers(filteredTickers);

    // Serialize individual price item and write to the cache
    await BluebirdPromise.all(transformedPrices
        .map(item => binanceCache.set(`exchangeratesapi_${item.code}`, JSON.stringify(item))));
};

const getExchangeratesapiPricesFromDB = async () => {
    // Read individual price item from cache and deserialize
    const prices = await BluebirdPromise.map(
        Object.getOwnPropertyNames(symbolMap),
        async (itemCode) => {
            const serializedPrice = await binanceCache.get(`exchangeratesapi_${itemCode}`);
            return JSON.parse(serializedPrice);
        },
        { concurrency: Object.getOwnPropertyNames(symbolMap).length },
    );
    return prices;
};

module.exports = {
    reloadPricesFromExchangerateapi,
    getExchangeratesapiPricesFromDB,
};
