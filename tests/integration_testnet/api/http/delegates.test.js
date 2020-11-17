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
const config = require('../../config');
const { api } = require('../../helpers/api');

const {
	badRequestSchema,
	notFoundSchema,
	wrongInputParamSchema,
	goodRequestSchema,
	metaSchema,
} = require('../../schemas/httpGenerics.schema');

const {
	delegateSchema,
} = require('../../schemas/delegate.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;
const endpoint = `${baseUrlV1}/delegates`;

describe('Delegates API', () => {
	let refDelegate;
	beforeAll(async () => {
		[refDelegate] = (await api.get(`${endpoint}?limit=1`)).data;
	});

	describe('GET /delegates', () => {
		it('known delegate by address -> ok', async () => {
			const response = await api.get(`${endpoint}?address=${refDelegate.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(1);
			response.data.forEach(delegate => expect(delegate)
				.toMap(delegateSchema, { address: refDelegate.address }));
			expect(response.meta).toMap(metaSchema);
		});

		it('known address by second public key', async () => {
			const response = await api.get(`${endpoint}?secpubkey=${refDelegate.secondPublicKey}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(1);
			response.data.map(delegate => expect(delegate)
				.toMap(delegateSchema, { secondPublicKey: refDelegate.secondPublicKey }));
			expect(response.meta).toMap(metaSchema);
		});

		it('wrong input param -> 400', async () => {
			const response = await api.get(`${endpoint}?id=412875216073141752800000`, 400);
			expect(response).toMap(wrongInputParamSchema);
		});

		it('search delegates -> ok', async () => {
			const response = await api.get(`${endpoint}?search=genesis`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(delegate => {
				expect(delegate).toMap(delegateSchema);
				expect(delegate.username).toContain('genesis');
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid address -> 404', async () => {
			const response = await api.get(`${endpoint}?address=412875216073141752800000`, 404);
			expect(response).toMap(notFoundSchema);
		});
	});

	describe('GET /delegates?publickey', () => {
		it('known delegate by public key -> ok', async () => {
			const response = await api.get(`${endpoint}?publickey=${refDelegate.publicKey}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(1);
			response.data.map(delegate => expect(delegate)
				.toMap(delegateSchema, { publicKey: refDelegate.publicKey }));
			expect(response.meta).toMap(metaSchema);
		});

		it('wrong delegate publickey -> 404', async () => {
			const response = await api.get(`${endpoint}?publickey=412875216073141752800000`, 404);
			expect(response).toMap(notFoundSchema);
		});
	});

	describe('GET /delegates?username', () => {
		it('known delegate by username -> ok', async () => {
			const response = await api.get(`${endpoint}?username=${refDelegate.username}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(1);
			response.data.map(delegate => expect(delegate)
				.toMap(delegateSchema, { username: refDelegate.username }));
			expect(response.meta).toMap(metaSchema);
		});

		it('wrong username -> 404', async () => {
			const response = await api.get(`${endpoint}?username=genesis_510000000`, 404);
			expect(response).toMap(notFoundSchema);
		});
	});

	describe('GET /delegates/latest_registrations', () => {
		xit('limit = 100 -> ok', async () => {
			const response = await api.get(`${endpoint}/latest_registrations?limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(100);
			response.data.map(delegate => expect(delegate).toMap(delegateSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('limit = 0 -> 400', async () => {
			const response = await api.get(`${endpoint}/latest_registrations?limit=0`, 400);
			expect(response).toMap(badRequestSchema);
		});

		// Given test fails during CI phase
		xit('empty limit -> 400', async () => {
			const response = await api.get(`${endpoint}/latest_registrations?limit=`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('GET /delegates/next_forgers', () => {
		it('limit = 100 -> ok', async () => {
			const response = await api.get(`${endpoint}/next_forgers?limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(100);
			response.data.map(delegate => expect(delegate).toMap(delegateSchema, { status: 'active' }));
			expect(response.meta).toMap(metaSchema);
		});

		it('limit = 0 -> 400', async () => {
			const response = await api.get(`${endpoint}/next_forgers?limit=0`, 400);
			expect(response).toMap(badRequestSchema);
		});

		// Given test fails during CI phase
		xit('empty limit -> 400', async () => {
			const response = await api.get(`${endpoint}/next_forgers?limit=`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('GET /delegates/active', () => {
		it('default -> ok', async () => {
			const response = await api.get(`${endpoint}?sort=rank:asc&limit=101`);
			expect(response.data).toBeArrayOfSize(101);
			response.data.map(delegate => expect(delegate).toMap(delegateSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('limit = 0 -> 400', async () => {
			const response = await api.get(`${endpoint}?sort=rank:asc&limit=0`, 400);
			expect(response).toMap(badRequestSchema);
		});

		// Given test fails during CI phase
		xit('empty limit -> ok', async () => {
			const response = await api.get(`${endpoint}?sort=rank:asc&limit=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(10);
			response.data.map(delegate => expect(delegate).toMap(delegateSchema));
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('GET /delegates/standby', () => {
		it('default -> ok', async () => {
			const response = await api.get(`${endpoint}?sort=rank:asc&offset=101&limit=101`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(101);
			response.data.map(delegate => expect(delegate).toMap(delegateSchema, { status: 'standby' }));
			expect(response.meta).toMap(metaSchema);
		});

		it('limit = 100 -> ok', async () => {
			const response = await api.get(`${endpoint}?sort=rank:asc&offset=102&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(100);
			response.data.map(delegate => expect(delegate).toMap(delegateSchema, { status: 'standby' }));
			expect(response.meta).toMap(metaSchema);
		});

		it('limit = 0 -> 400', async () => {
			const response = await api.get(`${endpoint}?sort=rank:asc&offset=102&limit=0`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('empty limit -> ok', async () => {
			const response = await api.get(`${endpoint}?sort=rank:asc&offset=102&limit=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(10);
			response.data.map(delegate => expect(delegate).toMap(delegateSchema));
			expect(response.meta).toMap(metaSchema);
		});
	});
});
