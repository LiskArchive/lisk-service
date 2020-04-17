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

const ordersEndpoint = 'get.market.orders';

const dataSchema = Joi.array().items(Joi.object({
	amount: Joi.string().required(),
	ask: Joi.string().required(),
	bid: Joi.string().required(),
	price: Joi.string().required(),
}));

const metaSchema = Joi.object({
	count: Joi.number().required(),
	total: Joi.number().required(),
	source: Joi.string().required(),
});

describe(`Endpoint ${ordersEndpoint}`, () => {
	const count = 200;

	it('is able to return list of orders for provider=bittrex', async () => {
		const provider = 'bittrex';
		const response = await api.getJsonRpcV1(ordersEndpoint, { provider });
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(count));
		expect(response.meta).toMap(metaSchema, { source: provider, count });
	});

	it('is able to return list of orders for provider=poloniex', async () => {
		const provider = 'poloniex';
		const response = await api.getJsonRpcV1(ordersEndpoint, { provider });
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(count));
		expect(response.meta).toMap(metaSchema, { source: provider, count });
	});

	it('returns a proper error when called with unknown param', async () => {
		const [error] = await to(api.getJsonRpcV1(ordersEndpoint, { source: 'invalid' }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});
});

