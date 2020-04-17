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

import { badRequestSchema } from '../../helpers/schemas';
import accountSchema from './schemas/account.schema';
import blockSchema from './schemas/block.schema';
import config from '../../config';
import request from '../../helpers/socketIoRpcMultiRequest';
import transactionSchema from './schemas/transaction.schema';

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlRpcV1 = `${baseUrl}/rpc`;
// const { transaction } = transactions;

const metaSchema = Joi.object({
	count: Joi.number().required(),
	offset: Joi.number().required(),
	total: Joi.number().required(),
}).required();

const metaWithoutTotalSchema = Joi.object({
	count: Joi.number().required(),
	offset: Joi.number().required(),
}).required();

const idSchema = Joi.alternatives(Joi.number(), Joi.string(), null).required();

const invalidParamsSchema = Joi.object({
	jsonrpc: Joi.string().required(),
	id: idSchema,
	error: badRequestSchema,
}).required();

const uuid = [
	'748d6b38-0614-414a-93a0-ab941e933788',
	'531e1d0e-e52d-4eea-9ebb-891f3989a03a',
	'69cbee14-87c6-443f-bf92-0d500d1daa54',
];

const jsonRpcSchema = Joi.object({
	jsonrpc: Joi.string().required(),
	id: idSchema,
	result: Joi.object(),
	error: Joi.object(),
}).required();

const jsonRpcListSchema = Joi.array().items(jsonRpcSchema);

const transactionsResponseSchema = Joi.object({
	data: Joi.array().items(transactionSchema),
	meta: metaSchema,
	links: Joi.object(),
}).required();

const blocksResponseSchema = Joi.object({
	data: Joi.array().items(blockSchema),
	meta: metaSchema,
	links: Joi.object(),
}).required();

const accountsResponseSchema = Joi.object({
	data: Joi.array().items(accountSchema),
	meta: metaWithoutTotalSchema,
	links: Joi.object(),
}).required();

describe('Multi-Request API', () => {
	it('responds to a correct request', async () => {
		const response = await request(baseUrlRpcV1, [
			{ jsonrpc: '2.0', method: 'get.transactions', params: { limit: 1 } },
			{ jsonrpc: '2.0', method: 'get.blocks', params: { limit: 1 } },
			{ jsonrpc: '2.0', method: 'get.accounts', params: { limit: 1 } },
		]);

		expect(response).toMap(jsonRpcListSchema.length(3));

		expect(response[0]).toMap(jsonRpcSchema, { jsonrpc: '2.0', id: 1 });
		expect(response[0].result).toMap(transactionsResponseSchema);

		expect(response[1]).toMap(jsonRpcSchema, { jsonrpc: '2.0', id: 2 });
		expect(response[1].result).toMap(blocksResponseSchema);

		expect(response[2]).toMap(jsonRpcSchema, { jsonrpc: '2.0', id: 3 });
		expect(response[2].result).toMap(accountsResponseSchema);
	});

	it('responds to a correct request with numerical IDs', async () => {
		const response = await request(baseUrlRpcV1, [
			{ jsonrpc: '2.0', id: 4, method: 'get.transactions', params: { limit: 1 } },
			{ jsonrpc: '2.0', id: 5, method: 'get.blocks', params: { limit: 1 } },
			{ jsonrpc: '2.0', id: 6, method: 'get.accounts', params: { limit: 1 } },
		]);

		expect(response).toMap(jsonRpcListSchema.length(3));

		expect(response[0]).toMap(jsonRpcSchema, { jsonrpc: '2.0', id: 4 });
		expect(response[0].result).toMap(transactionsResponseSchema);

		expect(response[1]).toMap(jsonRpcSchema, { jsonrpc: '2.0', id: 5 });
		expect(response[1].result).toMap(blocksResponseSchema);

		expect(response[2]).toMap(jsonRpcSchema, { jsonrpc: '2.0', id: 6 });
		expect(response[2].result).toMap(accountsResponseSchema);
	});

	it('responds to a correct request with numerical UUIDs', async () => {
		const response = await request(baseUrlRpcV1, [
			{ jsonrpc: '2.0', id: uuid[0], method: 'get.transactions', params: { limit: 1 } },
			{ jsonrpc: '2.0', id: uuid[1], method: 'get.blocks', params: { limit: 1 } },
			{ jsonrpc: '2.0', id: uuid[2], method: 'get.accounts', params: { limit: 1 } },
		]);

		expect(response).toMap(jsonRpcListSchema.length(3));

		expect(response[0]).toMap(jsonRpcSchema, { jsonrpc: '2.0', id: uuid[0] });
		expect(response[0].result).toMap(transactionsResponseSchema);

		expect(response[1]).toMap(jsonRpcSchema, { jsonrpc: '2.0', id: uuid[1] });
		expect(response[1].result).toMap(blocksResponseSchema);

		expect(response[2]).toMap(jsonRpcSchema, { jsonrpc: '2.0', id: uuid[2] });
		expect(response[2].result).toMap(accountsResponseSchema);
	});

	it('returns data despite a mix of correct and incorrect requests', async () => {
		const response = await request(baseUrlRpcV1, [
			{ jsonrpc: '2.0', method: 'get.transactions', params: { limit: 1 } },
			{ jsonrpc: '2.0', method: 'wrong_method', params: { } },
			{ jsonrpc: '2.0', method: 'get.accounts', params: { limit: 1 } },
		]);

		expect(response[0].result).toMap(transactionsResponseSchema);
		expect(response[1]).toMap(invalidParamsSchema);
		expect(response[2].result).toMap(accountsResponseSchema);
	});

	it('supports requests with no params', async () => {
		const response = await request(baseUrlRpcV1, [
			{ jsonrpc: '2.0', method: 'get.transactions' },
		]);

		expect(response).toMap(jsonRpcListSchema.length(1));
		expect(response[0].result).toMap(transactionsResponseSchema);
	});

	xit('fails on request without the JSON-RPC envelope', async () => {
		const response = await request(baseUrlRpcV1, [
			{ method: 'get.transactions', params: { limit: 1 } },
		]);

		expect(response).toMap(jsonRpcListSchema.length(1));
		expect(response[0]).toMap(invalidParamsSchema);
	});

	it('fails on request without specified method', async () => {
		const response = await request(baseUrlRpcV1, [
			{ jsonrpc: '2.0', params: { } },
		]);

		expect(response).toMap(jsonRpcListSchema.length(1));
		expect(response[0]).toMap(invalidParamsSchema);
	});
});
