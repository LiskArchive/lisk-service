/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
	badRequestSchema,
	wrongInputParamSchema,
	goodRequestSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	accountSchemaVersion5,
	dpos,
} = require('../../../schemas/api_v2/account.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;
const endpoint = `${baseUrlV2}/accounts`;

describe('Delegates API', () => {
	let refDelegate;
	beforeAll(async () => {
		[refDelegate] = (await api.get(`${endpoint}?isDelegate=true&limit=1`)).data;
	});

	describe('GET /accounts?isDelegate=true', () => {
		it('known delegate by address -> ok', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&address=${refDelegate.summary.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(1);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('wrong input param -> 400', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&id=412875216073141752800000`, 400);
			expect(response).toMap(wrongInputParamSchema);
		});

		it('search delegates -> ok', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&search=genesis`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.summary.username).toContain('genesis');
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid address -> 400', async () => {
			const response = await api.get(`${endpoint}?address=412875216073141752800000`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('GET /accounts?isDelegate=true&publickey', () => {
		it('known delegate by public key -> ok', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&publickey=${refDelegate.summary.publicKey}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(1);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('wrong delegate publickey -> 400', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&publickey=412875216073141752800000`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('GET /accounts?isDelegate=true&username', () => {
		it('known delegate by username -> ok', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&username=${refDelegate.summary.username}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(1);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('GET /accounts?isDelegate=true&status', () => {
		it('filter active delegates -> ok', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&status=active`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(response.meta).toMap(metaSchema);
		});

		xit('filter standby delegates -> ok', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&status=standby`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('filter delegates by combination -> ok', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&status=active,standby`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(response.meta).toMap(metaSchema);
		});
	});
});
