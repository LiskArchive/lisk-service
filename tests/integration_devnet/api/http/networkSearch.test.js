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

import api from '../../helpers/api';
import config from '../../config';

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

const errorSchema = Joi.object({
	message: Joi.string().required(),
	errors: Joi.array().length(1).required(),
}).required();

const dataSchema = Joi.array().items(searchItemSchema);

const goodRequestSchema = Joi.object({
	data: Joi.array().required(),
	meta: metaSchema,
	links: Joi.object().required(),
}).required();

const endpoint = `${config.SERVICE_ENDPOINT}/api/v1/search`;

describe(endpoint, () => {
	it('returns delegate by name ', async () => {
		const q = 'genesis_11';
		const response = await api.get(`${endpoint}?q=${q}`);

		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(1));
		expect(response.data[0]).toMap(searchItemSchema, { description: q, type: 'address' });
	});

	it('returns multiple delegate by name part ', async () => {
		const q = 'genesis_1';
		const response = await api.get(`${endpoint}?q=${q}`);

		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(10));
	});

	it('returns account by address ', async () => {
		const q = '1478505779553195737L';
		const response = await api.get(`${endpoint}?q=${q}`);

		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(1));
		expect(response.data[0]).toMap(searchItemSchema, { id: q, type: 'address' });
	});

	it('returns account by public key ', async () => {
		const id = '1478505779553195737L';
		const q = '5c4af5cb0c1c92df2ed4feeb9751e54e951f9d3f77196511f13e636cf6064e74';
		const response = await api.get(`${endpoint}?q=${q}`);

		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(1));
		expect(response.data[0]).toMap(searchItemSchema, { id, type: 'address' });
	});

	it('returns block by height ', async () => {
		const q = '400';
		const response = await api.get(`${endpoint}?q=${q}`);

		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(1));
		expect(response.data[0]).toMap(searchItemSchema, { description: q, type: 'block' });
	});

	it('returns block by id ', async () => {
		const q = '6524861224470851795';
		const response = await api.get(`${endpoint}?q=${q}`);

		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(1));
		expect(response.data[0]).toMap(searchItemSchema, { id: q, type: 'block' });
	});

	it('returns transaction by id ', async () => {
		const q = '3634383815892709956';
		const response = await api.get(`${endpoint}?q=${q}`);

		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(1));
		expect(response.data[0]).toMap(searchItemSchema, { id: q, type: 'tx' });
	});

	it('returns a proper error when called without q param', async () => {
		const [, response] = await to(api.get(endpoint, 400));
		expect(response).toMap(errorSchema, { message: 'Validation errors' });
	});
});
