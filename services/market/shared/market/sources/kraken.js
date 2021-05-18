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

const apiEndpoint = config.endpoints.kraken;

const krakenCache = CacheRedis('kraken', config.endpoints.redis);

const symbolMap = {
    LSK_USD: 'LSKUSD',
    LSK_EUR: 'LSKEUR',
    LSK_BTC: 'LSKBTC',
};

const fetchAllMarketTickers = async () => {
    try {
        const tradingPairs = Object.values(symbolMap).join(',');
        const response = await requestLib(`${apiEndpoint}/public/Ticker?pair=${tradingPairs}`);
        if (typeof response === 'string') return JSON.parse(response).data.result;
        return response.data.result;
    } catch (err) {
        logger.error(err.message);
        logger.error(err.stack);
        return err;
    }
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
            rate: currentTicker.o,
            updateTimestamp: Math.floor(Date.now() / 1000),
            sources: ['kraken'],
        };
        return price;
    });
    return transformedPrices;
};

const reloadPricesFromKraken = async () => {
    const tickers = await fetchAllMarketTickers();
    const transformedPrices = standardizeTickers(tickers);

    // Serialize individual price item and write to the cache
    await BluebirdPromise.all(transformedPrices
        .map(item => krakenCache.set(`kraken_${item.code}`, JSON.stringify(item))));

    return transformedPrices;
};

const getPricesFromKraken = async () => {
    // Read individual price item from cache and deserialize
    const prices = await BluebirdPromise.map(
        Object.getOwnPropertyNames(symbolMap),
        async (itemCode) => {
            const serializedPrice = await krakenCache.get(`kraken_${itemCode}`);
            return JSON.parse(serializedPrice);
        },
        { concurrency: Object.getOwnPropertyNames(symbolMap).length },
    );
    return prices;
};

module.exports = {
    reloadPricesFromKraken,
    getPricesFromKraken,
};
