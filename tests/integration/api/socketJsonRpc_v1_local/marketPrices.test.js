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

const pricesEndpoint = 'get.market.prices';

const dataSchema = Joi.array().items(Joi.object({
	code: Joi.string().required(),
	from: Joi.string().required(),
	to: Joi.string().required(),
	rate: Joi.string().required(),
	updateTimestamp: Joi.number().required(),
}));

const metaSchema = Joi.object({
	count: Joi.number().required(),
});

describe(`Endpoint ${pricesEndpoint}`, () => {
	it('is able to return list of prices', async () => {
		const count = 10;
		const response = await api.getJsonRpcV1(pricesEndpoint);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.min(count));
		expect(response.meta).toMap(metaSchema);
	});

	it('returns a proper error when called with unknown param', async () => {
		const [error] = await to(api.getJsonRpcV1(pricesEndpoint, { source: 'invalid' }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});
});
