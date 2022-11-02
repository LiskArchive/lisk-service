/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
const config = require('../../../config');
const { api } = require('../../../helpers/api');

const {
	goodRequestSchema,
	badRequestSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	delegateSchema,
} = require('../../../schemas/api_v3/delegate.schema');

const baseAddress = config.SERVICE_ENDPOINT;
const baseUrl = `${baseAddress}/api/v3`;
const endpoint = `${baseUrl}/dpos/delegates`;

describe('DPOS Delegates API', () => {
	let refDelegate;
	beforeAll(async () => {
		const response = await api.get(`${endpoint}?limit=1`);
		[refDelegate] = response.data;
	});

	describe('Retrieve delegates lists', () => {
		it('returns list of delegates', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns list of delegates with limit', async () => {
			const response = await api.get(`${endpoint}?limit=5`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
			response.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns list of delegates with offset', async () => {
			const response = await api.get(`${endpoint}?offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns list of delegates with combined limit and offset', async () => {
			const response = await api.get(`${endpoint}?limit=5&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
			response.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid params: zero limit -> 400 BAD REQUEST', async () => {
			const response = await api.get(`${endpoint}?limit=0`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('invalid params: negative limit -> 400 BAD REQUEST', async () => {
			const response = await api.get(`${endpoint}?limit=-5`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('invalid params: negative offset -> 400 BAD REQUEST', async () => {
			const response = await api.get(`${endpoint}?offset=-5`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('invalid params -> 400 BAD REQUEST', async () => {
			const response = await api.get(`${endpoint}?invalidParam=invalidValue`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve delegates by address', () => {
		it('returns delegate with known address', async () => {
			if (refDelegate.address) {
				const response = await api.get(`${endpoint}?address=${refDelegate.address}`);
				expect(response).toMap(goodRequestSchema);
				expect(response.data).toBeInstanceOf(Array);
				expect(response.data.length).toBe(1);
				response.data.forEach((delegate) => {
					expect(delegate).toMap(delegateSchema, { address: refDelegate.address });
				});
				expect(response.meta).toMap(metaSchema);
			}
		});

		it('returns list of delegates with empty address', async () => {
			const response = await api.get(`${endpoint}?address=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 400 BAD REQUEST with invalid address', async () => {
			const response = await api.get(`${endpoint}?address=lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve delegates by name', () => {
		it('returns delegate with known name', async () => {
			const response = await api.get(`${endpoint}?name=${refDelegate.name}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(1);
			response.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema, { name: refDelegate.name });
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns list of delegates with empty name', async () => {
			const response = await api.get(`${endpoint}?name=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 400 BAD REQUEST with invalid name', async () => {
			const response = await api.get(`${endpoint}?name=%&/007jagfkhaf2153yjdkn`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve delegates by status', () => {
		it('returns filtered delegates with known status: active', async () => {
			const response = await api.get(`${endpoint}?status=active`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema, { status: 'active' });
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns filtered delegates with known status: standby', async () => {
			const response = await api.get(`${endpoint}?status=standby`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema, { status: 'standby' });
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns filtered delegates with multiple statuses (CSV input)', async () => {
			const statuses = 'standby,punished,banned';
			const response = await api.get(`${endpoint}?status=${statuses}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema);
				expect(statuses.split(',')).toContain(delegate.status);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns list of delegates with empty status', async () => {
			const response = await api.get(`${endpoint}?status=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 400 BAD REQUEST with invalid status', async () => {
			const response = await api.get(`${endpoint}?status=%&/007jagfkhaf2153yjdkn`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve delegates based on multiple request params', () => {
		it('returns delegate when queried with known address and zero offset', async () => {
			const response = await api.get(`${endpoint}?address=${refDelegate.address}&offset=0`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(1);
			response.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema, { address: refDelegate.address });
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 200 OK when queried with known address and non-zero offset', async () => {
			const response = await api.get(`${endpoint}?address=${refDelegate.address}&offset=1`, 200);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(0);
			expect(response.meta).toMap(metaSchema);
		});

		it('returns delegate when queried with known name and zero offset', async () => {
			const response = await api.get(`${endpoint}?name=${refDelegate.name}&offset=0`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(1);
			response.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema, { name: refDelegate.name });
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 200 OK when queried with known name and non-zero offset', async () => {
			const response = await api.get(`${endpoint}?name=${refDelegate.name}&offset=1`, 200);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(0);
			expect(response.meta).toMap(metaSchema);
		});

		it('returns delegate when queried with known status and non-zero offset', async () => {
			const statuses = 'active,standby';
			const response = await api.get(`${endpoint}?status=${statuses}&offset=10`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema);
				expect(statuses.split(',')).toContain(refDelegate.status);
			});
			expect(response.meta).toMap(metaSchema);
		});
	});
});
