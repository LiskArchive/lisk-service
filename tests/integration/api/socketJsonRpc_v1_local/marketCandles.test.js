/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
import to from 'await-to-js';
import { api } from '../../helpers/socketIoRpcRequest';
import { JSON_RPC } from '../../helpers/errorCodes';
import { goodRequestSchema, badRequestSchema } from '../../helpers/schemas';

const candlesEndpoint = 'get.market.candles';

const dataSchema = Joi.array().items(Joi.object({
	btcVolume: Joi.string().required(),
	close: Joi.string().required(),
	high: Joi.string().required(),
	liskVolume: Joi.string().required(),
	low: Joi.string().required(),
	open: Joi.string().required(),
	timestamp: Joi.number().required(),
	firstTrade: Joi.number().optional(),
	lastTrade: Joi.number().optional(),
	nextEnd: Joi.number().optional(),
	numTrades: Joi.number().optional(),
}));

const metaSchema = Joi.object({
	count: Joi.number().required(),
	total: Joi.number().required(),
	source: Joi.string().required(),
	timeframe: Joi.string().required(),
	fromTimestamp: Joi.number().optional(),
	toTimestamp: Joi.number().optional(),
});

describe(`Endpoint ${candlesEndpoint}`, () => {
	it('is able to return list of candles for a given provider', async () => {
		const count = 0; // TODO fix the API and change the count
		const provider = 'bittrex';
		const response = await api.getJsonRpcV1(candlesEndpoint, { provider });
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toHaveLength(count);
		expect(response.data).toMap(dataSchema);
		expect(response.meta).toMap(metaSchema, { source: provider });
	});

	it('is able to return list of candles for a given provider and density=hour', async () => {
		const count = 0; // TODO fix the API and change the count
		const provider = 'bittrex';
		const density = 'hour';
		const response = await api.getJsonRpcV1(candlesEndpoint, { provider, density });
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(count));
		expect(response.meta).toMap(metaSchema, { source: provider });
	});

	it.skip('is able to return list of candles for a given provider=bittrex and density=day', async () => {
		const count = 20;
		const provider = 'bittrex';
		const density = 'day';
		const response = await api.getJsonRpcV1(candlesEndpoint, { provider, density });
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.min(count));
		expect(response.meta).toMap(metaSchema, { source: provider });
	});


	it.skip('is able to return list of candles for a given provider=poloniex and density=day', async () => {
		const count = 20;
		const provider = 'poloniex';
		const density = 'day';
		const response = await api.getJsonRpcV1(candlesEndpoint, { provider, density });
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.min(count));
		expect(response.meta).toMap(metaSchema, { source: provider });
	});

	it('returns a proper error when called without provider param', async () => {
		const [error] = await to(api.getJsonRpcV1(candlesEndpoint));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});
});

