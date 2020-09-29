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
import Joi from 'joi';
import to from 'await-to-js';

import { api } from '../../helpers/socketIoRpcRequest';
import { JSON_RPC } from '../../helpers/errorCodes';
import { badRequestSchema, goodRequestSchema, delegateSchema } from '../../helpers/schemas';

const nextForgersDataSchema = Joi.array().items(delegateSchema).required();

const getNextForgers = async params => api.getJsonRpcV1('get.next_forgers', params);

describe('Method get.next_forgers', () => {
	it('returns 100 forgers when limit = 100', async () => {
		const limit = 100;
		const result = await getNextForgers({ limit });
		expect(result).toMap(goodRequestSchema);
		expect(result.data).toMap(nextForgersDataSchema.length(limit));
	});

	it('returns 10 forgers when no limit provided', async () => {
		const limit = 10;
		const result = await getNextForgers();
		expect(result).toMap(goodRequestSchema);
		expect(result.data).toMap(nextForgersDataSchema.length(limit));
	});

	it(`returns INVALID_REQUEST (${JSON_RPC.INVALID_PARAMS[0]}) when limit = 0`, async () => {
		const [error] = await to(getNextForgers({ limit: 0 }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	it(`returns INVALID_REQUEST (${JSON_RPC.INVALID_PARAMS[0]}) when limit = ''`, async () => {
		const [error] = await to(getNextForgers({ limit: '' }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});
});
