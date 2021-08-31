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
		let response;
		do {
			// eslint-disable-next-line no-await-in-loop
			response = await api.get(`${baseUrlV2}/accounts?isDelegate=true&limit=1`);
		} while (!response.data);
		[refDelegate] = response.data;
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

	describe('GET /accounts?isDelegate=true&publicKey', () => {
		it('known delegate by public key -> ok', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&publicKey=${refDelegate.summary.publicKey}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(1);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('wrong delegate publicKey -> 400', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&publicKey=412875216073141752800000`, 400);
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

		it('filter standby delegates -> ok', async () => {
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

	describe('Delegate accounts sorted by balance', () => {
		it('returns 10 delegate accounts sorted by balance descending', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&sort=balance:desc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevAccount = response.data[i - 1];
					const currAccount = response.data[i];
					expect(BigInt(prevAccount.summary.balance))
						.toBeGreaterThanOrEqual(BigInt(currAccount.summary.balance));
				}
			}
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 10 delegate accounts sorted by balance ascending', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&sort=balance:asc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevAccount = response.data[i - 1];
					const currAccount = response.data[i];
					expect(BigInt(prevAccount.summary.balance))
						.toBeLessThanOrEqual(BigInt(currAccount.summary.balance));
				}
			}
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Delegate accounts sorted by rank', () => {
		it('returns 10 delegate accounts sorted by rank descending', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&sort=rank:desc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevAccount = response.data[i - 1];
					const currAccount = response.data[i];
					expect(prevAccount.dpos.delegate.rank).toBeGreaterThan(currAccount.dpos.delegate.rank);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 10 delegate accounts sorted by rank ascending', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&sort=rank:asc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevAccount = response.data[i - 1];
					const currAccount = response.data[i];
					expect(prevAccount.dpos.delegate.rank).toBeLessThan(currAccount.dpos.delegate.rank);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Search genesis delegate accounts with sorting specified', () => {
		it('returns 10 genesis delegate accounts sorted by balance descending', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&search=genesis&sort=balance:desc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.summary.username.includes('genesis')).toBeTruthy();
			});
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevAccount = response.data[i - 1];
					const currAccount = response.data[i];
					expect(BigInt(prevAccount.summary.balance))
						.toBeGreaterThanOrEqual(BigInt(currAccount.summary.balance));
				}
			}
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 10 genesis delegate accounts sorted by balance descending with limit & offset', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&search=genesis&sort=balance:desc&limit=5&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(5);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.summary.username.includes('genesis')).toBeTruthy();
			});
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevAccount = response.data[i - 1];
					const currAccount = response.data[i];
					expect(BigInt(prevAccount.summary.balance))
						.toBeGreaterThanOrEqual(BigInt(currAccount.summary.balance));
				}
			}
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 10 genesis delegate accounts sorted by balance ascending', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&search=genesis&sort=balance:asc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.summary.username.includes('genesis')).toBeTruthy();
			});
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevAccount = response.data[i - 1];
					const currAccount = response.data[i];
					expect(BigInt(prevAccount.summary.balance))
						.toBeLessThanOrEqual(BigInt(currAccount.summary.balance));
				}
			}
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 10 genesis delegate accounts sorted by balance ascending with limit & offset', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&search=genesis&sort=balance:asc&limit=5&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(5);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.summary.username.includes('genesis')).toBeTruthy();
			});
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevAccount = response.data[i - 1];
					const currAccount = response.data[i];
					expect(BigInt(prevAccount.summary.balance))
						.toBeLessThanOrEqual(BigInt(currAccount.summary.balance));
				}
			}
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 10 genesis delegate accounts sorted by rank descending', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&search=genesis&sort=rank:desc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.summary.username.includes('genesis')).toBeTruthy();
			});
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevAccount = response.data[i - 1];
					const currAccount = response.data[i];
					expect(prevAccount.dpos.delegate.rank).toBeGreaterThan(currAccount.dpos.delegate.rank);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 10 genesis delegate accounts sorted by rank descending with limit & offset', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&search=genesis&sort=rank:desc&limit=5&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(5);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.summary.username.includes('genesis')).toBeTruthy();
			});
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevAccount = response.data[i - 1];
					const currAccount = response.data[i];
					expect(prevAccount.dpos.delegate.rank).toBeGreaterThan(currAccount.dpos.delegate.rank);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 10 genesis delegate accounts sorted by rank ascending', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&search=genesis&sort=rank:asc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.summary.username.includes('genesis')).toBeTruthy();
			});
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevAccount = response.data[i - 1];
					const currAccount = response.data[i];
					expect(prevAccount.dpos.delegate.rank).toBeLessThan(currAccount.dpos.delegate.rank);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 10 genesis delegate accounts sorted by rank ascending with limit & offset', async () => {
			const response = await api.get(`${endpoint}?isDelegate=true&search=genesis&sort=rank:asc&limit=5&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(5);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.summary.username.includes('genesis')).toBeTruthy();
			});
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevAccount = response.data[i - 1];
					const currAccount = response.data[i];
					expect(prevAccount.dpos.delegate.rank).toBeLessThan(currAccount.dpos.delegate.rank);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});
	});
});
