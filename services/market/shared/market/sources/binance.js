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
const { HTTP, Logger } = require('lisk-service-framework');
const moment = require('moment');

const requestLib = HTTP.request;
const logger = Logger();

const rediscache = require('../../database/redis');

const initRedisCache = () => rediscache('binance_prices');

const config = require('../../../config.js');

const apiEndpoint = config.endpoints.binance;

const symbolMap = {
    LSK_BTC: 'LSKBTC',
    LSK_ETH: 'LSKETH',
    LSK_USDT: 'LSKUSDT',
    EUR_USDT: 'EURUSDT',
    BTC_EUR: 'BTCEUR',
    BTC_GBP: 'BTCGBP',
    ETH_GBP: 'ETHGBP',
    BTC_RUB: 'BTCRUB',
    ETH_EUR: 'ETHEUR',
    ETH_RUB: 'ETHRUB',
    USDT_RUB: 'USDTRUB',
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
            updateTimestamp: moment(Date.now()).unix(),
            sources: ['binance'],
        };
        return price;
    });
    return transformedPrices;
};

const reloadPricesFromBinance = async () => {
    const binanceCache = await initRedisCache();
    const tickers = await fetchAllMarketTickers();
    const filteredTickers = filterTickers(tickers);
    const transformedPrices = standardizeTickers(filteredTickers);
    await binanceCache.upsert(transformedPrices);
};

const getBinancePricesFromCache = async () => {
    const binanceCache = await initRedisCache();
    const latestPricesFromCache = await binanceCache.find();
    return latestPricesFromCache;
};

module.exports = {
    reloadPricesFromBinance,
    getBinancePricesFromCache,
};
