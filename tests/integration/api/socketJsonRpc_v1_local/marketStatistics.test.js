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
import { badRequestSchema } from '../../helpers/schemas';

const statisticsEndpoint = 'get.market.statistics';

const goodRequestSchema = Joi.object({
	data: Joi.object().required(),
	meta: Joi.object().required(),
	links: Joi.object().required(),
});

const dataSchema = Joi.object({
	btcVolume: Joi.string().required(),
	high: Joi.string().required(),
	last: Joi.string().required(),
	liskVolume: Joi.string().required(),
	low: Joi.string().required(),
	tradesCount: Joi.string().required(),
});

const metaSchema = Joi.object({
	source: Joi.string().required(),
});

describe(`Endpoint ${statisticsEndpoint}`, () => {
	it.skip('is able to return list of statistics for a given provider', async () => {
		const provider = 'bittrex';
		const response = await api.getJsonRpcV1(statisticsEndpoint, { provider });
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema);
		expect(response.meta).toMap(metaSchema, { source: provider });
	});

	it('returns a proper error when called with unknown param', async () => {
		const [error] = await to(api.getJsonRpcV1(statisticsEndpoint, { source: 'invalid' }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});
});

