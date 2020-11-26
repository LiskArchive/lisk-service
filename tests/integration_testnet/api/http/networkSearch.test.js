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
const config = require('../../config');
const { api } = require('../../helpers/api');

const {
	notFoundSchema,
	goodRequestSchema,
	// metaSchema,
} = require('../../schemas/httpGenerics.schema');

const {
	searchItemSchema,
} = require('../../schemas/networkSearch.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;
const endpoint = `${baseUrlV1}/search`;

describe('GET /search', () => {
	let refDelegate;
	let refBlock;
	let refTransaction;
	beforeAll(async () => {
		[refDelegate] = (await api.get(`${baseUrlV1}/delegates?limit=1`)).data;
		[refBlock] = (await api.get(`${baseUrlV1}/blocks?limit=1`)).data;
		[refTransaction] = (await api.get(`${baseUrlV1}/transactions?limit=1`)).data;
	});

	it('returns delegate by name ', async () => {
		const q = refDelegate.username;
		const response = await api.get(`${endpoint}?q=${q}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeArrayOfSize(1);
		response.data.forEach(delegate => expect(delegate)
			.toMap(searchItemSchema, { description: q, type: 'address' }));
		// expect(response.meta).toMap(metaSchema);
	});

	it('returns multiple delegate by name part ', async () => {
		const q = refDelegate.username.slice(0, -1);
		const response = await api.get(`${endpoint}?q=${q}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeArrayOfSize(1);
		response.data.forEach(delegate => expect(delegate)
			.toMap(searchItemSchema, { description: refDelegate.username, type: 'address' }));
		// expect(response.meta).toMap(metaSchema);
	});

	// TODO: Fail CI pipeline (Not found)
	xit('returns account by address ', async () => {
		const q = refDelegate.address;
		const response = await api.get(`${endpoint}?q=${q}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeArrayOfSize(1);
		response.data.forEach(delegate => expect(delegate)
			.toMap(searchItemSchema, { id: q, type: 'address' }));
		// expect(response.meta).toMap(metaSchema);
	});

	// TODO: Fail CI pipeline (Not found)
	xit('returns account by public key ', async () => {
		const id = refDelegate.address;
		const q = refDelegate.publicKey;
		const response = await api.get(`${endpoint}?q=${q}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeArrayOfSize(1);
		response.data.forEach(delegate => expect(delegate)
			.toMap(searchItemSchema, { id, type: 'address' }));
		// expect(response.meta).toMap(metaSchema);
	});

	it('returns block by height', async () => {
		const q = '400';
		const response = await api.get(`${endpoint}?q=${q}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeArrayOfSize(1);
		response.data.forEach(delegate => expect(delegate)
			.toMap(searchItemSchema, { description: q, type: 'block' }));
		// expect(response.meta).toMap(metaSchema);
	});

	it('returns block by id', async () => {
		const q = refBlock.id;
		const response = await api.get(`${endpoint}?q=${q}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeArrayOfSize(1);
		response.data.forEach(delegate => expect(delegate)
			.toMap(searchItemSchema, { id: q, type: 'block' }));
		// expect(response.meta).toMap(metaSchema);
	});

	it('returns transaction by id ', async () => {
		const q = refTransaction.id;
		const response = await api.get(`${endpoint}?q=${q}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeArrayOfSize(1);
		response.data.forEach(delegate => expect(delegate)
			.toMap(searchItemSchema, { id: q, type: 'tx' }));
		// expect(response.meta).toMap(metaSchema);
	});

	it('returns a proper error when called without q param', async () => {
		const response = await api.get(endpoint, 400);
		expect(response).toMap(notFoundSchema);
	});

	it('returns a proper error when called with empty q param', async () => {
		const response = await api.get(`${endpoint}?q=`, 400);
		expect(response).toMap(notFoundSchema);
	});
});
