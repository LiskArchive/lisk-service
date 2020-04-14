/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
import Joi from '@hapi/joi';
import config from '../../config';
import request from '../../helpers/socketIoRpcRequest';
import { JSON_RPC } from '../../helpers/errorCodes';

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlRpcV1 = `${baseUrl}/rpc`;

const marketPriceDataSchema = Joi.object({
	code: Joi.string(),
	from: Joi.string(),
	to: Joi.string(),
	rate: Joi.string(),
	updateTimestamp: Joi.number(),
	huy: Joi.string(),
}).required();

const marketPriceMetaSchema = Joi.object({
	count: Joi.number(),
	total: Joi.number(),
}).required();

const marketOrdersDataSchema = Joi.object({
	amount: Joi.string(),
	ask: Joi.string(),
	bid: Joi.string(),
	price: Joi.string(),
}).required();

const marketOrdersMetaSchema = Joi.object({
	count: Joi.number(),
	total: Joi.number(),
	source: Joi.string(),
}).required();

const marketCandlesPoloniexSchema = Joi.object({
	btcVolume: Joi.string(),
	close: Joi.string(),
	high: Joi.string(),
	liskVolume: Joi.string(),
	low: Joi.string(),
	open: Joi.string(),
	firstTrade: Joi.number(),
	lastTrade: Joi.number(),
	nextEnd: Joi.number(),
	numTrades: Joi.number(),
	timestamp: Joi.number(),
}).required();

const marketCandlesBittrexSchema = Joi.object({
	btcVolume: Joi.string(),
	close: Joi.string(),
	high: Joi.string(),
	liskVolume: Joi.string(),
	low: Joi.string(),
	open: Joi.string(),
	timestamp: Joi.number(),
}).required();

const marketCandlesMetaSchema = Joi.object({
	count: Joi.number(),
	total: Joi.number(),
	timeframe: Joi.number(),
	source: Joi.string(),
	fromTimestamp: Joi.string(),
	toTimestamp: Joi.string(),
}).required();

const invalidParamsSchema = Joi.object({
	code: Joi.number(),
	message: Joi.string(),
}).required();

const marketStatsSchema = Joi.object({
	btcVolume: Joi.string(),
	high: Joi.string(),
	last: Joi.string(),
	liskVolume: Joi.string(),
	low: Joi.string(),
	tradesCount: Joi.number(),
}).required();

const marketStatsMetaSchema = Joi.object({
	source: Joi.string(),
}).required();

const getMarketPrices = async params => request(baseUrlRpcV1, 'get.market.prices', params);
const getMarketOrders = async params => request(baseUrlRpcV1, 'get.market.orders', params);
const getMarketCandles = async params => request(baseUrlRpcV1, 'get.market.candles', params);
const getMarketStatistics = async params => request(baseUrlRpcV1, 'get.market.statistics', params);

describe('get.market.prices', () => {
	it('is able to get market prices', async () => {
		const { result } = await getMarketPrices({});
		expect(result.data[0]).toMap(marketPriceDataSchema);
		expect(result.meta).toMap(marketPriceMetaSchema);
	});
});

describe.skip('get.market.orders', () => {
	it('is able to get market orders with poloniex', async () => {
		const { result } = await request(baseUrlRpcV1, 'get.market.orders', { provider: 'poloniex' });
		expect(result.data[0]).toMap(marketOrdersDataSchema);
		expect(result.meta).toMap(marketPriceMetaSchema);
	});

	it('is able to get market orders with bittrex', async () => {
		const { result } = await getMarketOrders({ provider: 'bittrex' });
		expect(result.data[0]).toMap(marketOrdersDataSchema);
		expect(result.meta).toMap(marketOrdersMetaSchema);
	});

	it('wrong parameter key -> invalid params', async () => {
		const { error } = await getMarketOrders({ provide: 'poloniex' }).catch(e => e);
		expect(error).toMap(invalidParamsSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	// currently returns server error
	xit('wrong parameter value -> invalid params', async () => {
		const { error } = await getMarketOrders({ provider: 'poloni' }).catch(e => e);
		expect(error).toMap(invalidParamsSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});
});

describe('get.market.candles', () => {
	xit('is able to get market candles with poloniex', async () => {
		const { result } = await getMarketCandles({ provider: 'poloniex' });
		expect(result.data[0]).toMap(marketCandlesPoloniexSchema);
		expect(result.meta).toMap(marketCandlesMetaSchema);
	});

	xit('is able to get market candles with bittrex', async () => {
		const { result } = await getMarketCandles({ provider: 'bittrex' });
		expect(result.data[0]).toMap(marketCandlesBittrexSchema);
		expect(result.meta).toMap(marketCandlesMetaSchema);
	});

	xit('is able to get market candles with bittrex with density: minute', async () => {
		const { result } = await getMarketCandles({ provider: 'bittrex', density: 'minute' });
		expect(result.data[0]).toMap(marketCandlesBittrexSchema);
		expect(result.meta).toMap(marketCandlesMetaSchema, { timeframe: 'minute' });
	});

	xit('is able to get market candles with bittrex with density: hour', async () => {
		const { result } = await getMarketCandles({ provider: 'bittrex', density: 'hour' });
		expect(result.data[0]).toMap(marketCandlesBittrexSchema);
		expect(result.meta).toMap(marketCandlesMetaSchema, { timeframe: 'hour' });
	});

	xit('is able to get market candles with bittrex with density: day', async () => {
		const { result } = await getMarketCandles({ provider: 'bittrex', density: 'day' });
		expect(result.data[0]).toMap(marketCandlesBittrexSchema);
		expect(result.meta).toMap(marketCandlesMetaSchema, { timeframe: 'day' });
	});

	xit('wrong parameter key -> -32602', async () => {
		const { error } = await getMarketCandles({ provide: 'poloniex' }).catch(e => e);
		expect(error).toMap(invalidParamsSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	// currently returns server error
	xit('wrong parameter value -> -32602', async () => {
		const { error } = await getMarketCandles({ provider: 'poloni' }).catch(e => e);
		expect(error).toMap(invalidParamsSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});
});

describe('get.market.statistics', () => {
	xit('is able to get market stats with bittrex', async () => {
		const { result } = await getMarketStatistics({ provider: 'bittrex' });
		expect(result.data).toMapRequiredSchema(marketStatsSchema);
		expect(result.meta).toMapRequiredSchema(marketStatsMetaSchema, { source: 'bittrex' });
	});

	xit('is able to get market stats with poloniex', async () => {
		const { result } = await getMarketStatistics({ provider: 'poloniex' }).catch(e => e);
		expect(result.data).toMapRequiredSchema(marketStatsSchema);
		expect(result.meta).toMapRequiredSchema(marketStatsMetaSchema, { source: 'poloniex' });
	});

	xit('wrong parameter key -> -32602', async () => {
		const { error } = await getMarketStatistics({ provide: 'poloniex' }).catch(e => e);
		expect(error).toMap(invalidParamsSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	// currently returns server error
	xit('wrong parameter value -> -32602', async () => {
		const { error } = await getMarketStatistics({ provider: 'poloni' }).catch(e => e);
		expect(error).toMap(invalidParamsSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});
});
