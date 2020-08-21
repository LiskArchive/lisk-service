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
import Joi from 'joi';
import to from 'await-to-js';

import { api } from '../../helpers/socketIoRpcRequest';
import { JSON_RPC } from '../../helpers/errorCodes';
import { badRequestSchema } from '../../helpers/schemas';
import accounts from './constants/accounts';
import blocks from './constants/blocks';
import transactions from './constants/transactions';

const metaSchema = Joi.object({
	count: Joi.number().required(),
	total: Joi.number().required(),
}).required();

const searchItemSchema = Joi.object({
	score: Joi.number().required(),
	description: Joi.string(),
	id: Joi.string().required(),
	type: Joi.string().required(),
}).required();

const dataSchema = Joi.array().items(searchItemSchema);

const goodRequestSchema = Joi.object({
	data: Joi.array().required(),
	meta: metaSchema,
}).required();

const endpoint = 'get.search';

describe(endpoint, () => {
	it('returns delegate by name ', async () => {
		const q = 'genesis_11';
		const response = await api.getJsonRpcV1(endpoint, { q });

		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(1));
		expect(response.data[0]).toMap(searchItemSchema, { description: q, type: 'address' });
	});

	it('returns multiple delegate by name part ', async () => {
		const q = 'genesis_1';
		const response = await api.getJsonRpcV1(endpoint, { q });

		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(10));
	});

	it('returns account by address ', async () => {
		const q = accounts.genesis.address;
		const response = await api.getJsonRpcV1(endpoint, { q });

		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(1));
		expect(response.data[0]).toMap(searchItemSchema, { id: q, type: 'address' });
	});

	it('returns account by public key ', async () => {
		const id = accounts.genesis.address;
		const q = accounts.genesis.publicKey;
		const response = await api.getJsonRpcV1(endpoint, { q });

		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(1));
		expect(response.data[0]).toMap(searchItemSchema, { id, type: 'address' });
	});

	it('returns block by height', async () => {
		const q = '400';
		const response = await api.getJsonRpcV1(endpoint, { q });

		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(1));
		expect(response.data[0]).toMap(searchItemSchema, { description: q, type: 'block' });
	});

	xit('returns block by id', async () => {
		const q = blocks.id;
		const response = await api.getJsonRpcV1(endpoint, { q });

		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(1));
		expect(response.data[0]).toMap(searchItemSchema, { id: q, type: 'block' });
	});

	xit('returns transaction by id ', async () => {
		const q = transactions.id;
		const response = await api.getJsonRpcV1(endpoint, { q });

		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(1));
		expect(response.data[0]).toMap(searchItemSchema, { id: q, type: 'tx' });
	});

	xit('returns a proper error when called without q param', async () => {
		const [error] = await to(api.getJsonRpcV1(endpoint));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});
});
