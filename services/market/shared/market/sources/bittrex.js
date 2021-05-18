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

const requestLib = HTTP.request;
const logger = Logger();

const config = require('../../../config.js');

const apiEndpoint = config.endpoints.bittrex;

const symbolMap = {
    LSK_BTC: 'LSK-BTC',
    BTC_USD: 'BTC-USD',
    BTC_EUR: 'BTC-EUR',
};

const fetchAllMarketTickers = async () => {
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

const reloadPricesFromBittrex = async () => {
    const tickers = await fetchAllMarketTickers();
    const filteredTickers = filterTickers(tickers);
    const transformedPrices = standardizeTickers(filteredTickers);

    // TODO: Write to the cache

    return transformedPrices;
};

const getPricesFromBittrex = async () => {
    // TODO: Read from cache, when implemented
    return reloadPricesFromBittrex();
};

module.exports = {
    reloadPricesFromBittrex,
    getPricesFromBittrex,
};
