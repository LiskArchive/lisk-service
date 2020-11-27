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
const { request } = require('../../helpers/socketIoRpcRequest');

const {
	resultEnvelopeSchema,
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../schemas/rpcGenerics.schema');

const {
	searchItemSchema,
} = require('../../schemas/networkSearch.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v1`;
const searchNetwork = async params => request(wsRpcUrl, 'get.search', params);

describe('Method get.search', () => {
	let refDelegate;
	let refBlock;
	let refTransaction;
	beforeAll(async () => {
		[refDelegate] = (await request(wsRpcUrl, 'get.delegates', { limit: 1 })).result.data;
		[refBlock] = (await request(wsRpcUrl, 'get.blocks', { limit: 1 })).result.data;
		[refTransaction] = (await request(wsRpcUrl, 'get.transactions', { limit: 1 })).result.data;
	});

	it('returns delegate by name ', async () => {
		const q = refDelegate.username;
		const response = await searchNetwork({ q });

		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(resultEnvelopeSchema);
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toEqual(1);
		result.data.forEach(item => expect(item)
			.toMap(searchItemSchema, { description: q, type: 'address' }));
		expect(result.meta).toMap(metaSchema, { count: 1 });
	});

	it('returns multiple delegate by name part ', async () => {
		const q = refDelegate.username.slice(0, -1);
		const response = await searchNetwork({ q });

		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(resultEnvelopeSchema);
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		result.data.forEach(item => expect(item)
			.toMap(searchItemSchema, { description: refDelegate.username, type: 'address' }));
		expect(result.meta).toMap(metaSchema);
	});

	// TODO: Fail CI pipeline
	xit('returns account by address ', async () => {
		const q = refDelegate.address;
		const response = await searchNetwork({ q });

		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(resultEnvelopeSchema);
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toEqual(1);
		result.data.forEach(item => expect(item)
			.toMap(searchItemSchema, { id: q, type: 'address' }));
		expect(result.meta).toMap(metaSchema, { count: 1 });
	});

	// TODO: Fail CI pipeline
	xit('returns account by public key ', async () => {
		const id = refDelegate.address;
		const q = refDelegate.publicKey;
		const response = await searchNetwork({ q });

		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(resultEnvelopeSchema);
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toEqual(1);
		result.data.forEach(item => expect(item)
			.toMap(searchItemSchema, { id, type: 'address' }));
		expect(result.meta).toMap(metaSchema, { count: 1 });
	});

	it('returns block by height', async () => {
		const q = '400';
		const response = await searchNetwork({ q });

		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(resultEnvelopeSchema);
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toEqual(1);
		result.data.forEach(item => expect(item)
			.toMap(searchItemSchema, { description: q, type: 'block' }));
		expect(result.meta).toMap(metaSchema, { count: 1 });
	});

	it('returns block by id', async () => {
		const q = refBlock.id;
		const response = await searchNetwork({ q });

		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(resultEnvelopeSchema);
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toEqual(1);
		result.data.forEach(item => expect(item)
			.toMap(searchItemSchema, { id: q, type: 'block' }));
		expect(result.meta).toMap(metaSchema, { count: 1 });
	});

	// TODO: Fail CI pipeline
	xit('returns transaction by id ', async () => {
		const q = refTransaction.id;
		const response = await searchNetwork({ q });

		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(resultEnvelopeSchema);
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toEqual(1);
		result.data.forEach(item => expect(item)
			.toMap(searchItemSchema, { id: q, type: 'tx' }));
		expect(result.meta).toMap(metaSchema, { count: 1 });
	});

	it('returns a proper error when called without q param', async () => {
		const error = await searchNetwork({});
		expect(error).toMap(invalidParamsSchema);
	});
});
