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
	goodRequestSchema,
	badRequestSchema,
	notFoundSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	accountSchemaVersion5,
	dpos,
} = require('../../../schemas/api_v2/account.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;
const endpoint = `${baseUrlV2}/accounts`;
const accountEndpoint = `${baseUrlV2}/account`;

describe('Accounts API', () => {
	let delegate;
	beforeAll(async () => {
		const response = await api.get(`${baseUrlV2}/accounts?isDelegate=true&limit=1`);
		[delegate] = response.data;
	});

	describe('Retrieve account list', () => {
		it('allows to retrieve list of accounts (no params)', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			expect(response.meta).toMap(metaSchema);
		});

		it('allows to retrieve list of non-delegate accounts with \'isDelegate=false\'', async () => {
			const response = await api.get(`${endpoint}?isDelegate=false`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.summary.isDelegate).toBeFalsy();
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve account list by address', () => {
		it('known address -> ok', async () => {
			const response = await api.get(`${endpoint}?address=${delegate.summary.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.length).toEqual(1);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			expect(response.meta).toMap(metaSchema);
		});

		it('known address written lowercase -> ok', async () => {
			const response = await api.get(`${endpoint}?address=${delegate.summary.address.toLowerCase()}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.length).toEqual(1);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			expect(response.meta).toMap(metaSchema);
		});

		it('unknown address -> 400', async () => {
			const url = `${endpoint}?address=lsknww5x4dv93x3euds4w72d99ouwnqojyw5qrm`;
			const expectedStatus = 400;
			const response = await api.get(url, expectedStatus);
			expect(response).toMap(badRequestSchema);
		});

		it('binary address -> 400', async () => {
			const url = `${endpoint}?address=76d8a63965fb31052fb245243382e35c2ea372d8`;
			const expectedStatus = 400;
			const response = await api.get(url, expectedStatus);
			expect(response).toMap(badRequestSchema);
		});

		it('invalid address -> 400', async () => {
			const url = `${endpoint}?address=L`;
			const expectedStatus = 400;
			const response = await api.get(url, expectedStatus);
			expect(response).toMap(notFoundSchema);
		});

		it('empty address returns a default list', async () => {
			const url = `${endpoint}?publicKey=`;
			const response = await api.get(url);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			expect(response.meta).toMap(metaSchema);
		});

		it('wrong address -> 404', async () => {
			const url = `${accountEndpoint}/999999999L`;
			const expectedStatus = 404;
			const response = await api.get(url, expectedStatus);
			expect(response).toMap(notFoundSchema);
		});
	});

	describe('Retrieve account list by public key', () => {
		it('known address by publicKey', async () => {
			const url = `${endpoint}?publicKey=${delegate.summary.publicKey}`;
			const expectedStatus = 200;
			const response = await api.get(url, expectedStatus);
			expect(response.data.length).toEqual(1);
			expect(response).toMap(goodRequestSchema);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid publicKey -> 400', async () => {
			const url = `${endpoint}?publicKey=invalid_pk`;
			const expectedStatus = 400;
			const response = await api.get(url, expectedStatus);
			expect(response).toMap(badRequestSchema);
		});

		it('empty public key parameter returns a default list', async () => {
			const url = `${endpoint}?publicKey=`;
			const response = await api.get(url);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
		});
	});

	describe('Retrieve a delegate', () => {
		it('known delegate by address -> contain delegate data', async () => {
			const response = await api.get(`${endpoint}?address=${delegate.summary.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.length).toEqual(1);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('known delegate by username -> contain delegate data', async () => {
			const response = await api.get(`${endpoint}?username=${delegate.summary.username}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.length).toEqual(1);
			response.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('existing account by username with wrong param: -> ok', async () => {
			const url = `${accountEndpoint}/address:${delegate.username}`;
			const expectedStatus = 404;
			const response = api.get(url, expectedStatus);
			expect(response).resolves.toMap(notFoundSchema);
		});
	});

	describe('Retrieve top accounts', () => {
		it('returns 100 accounts sorted by balance descending when limit set to 100', async () => {
			const response = await api.get(`${endpoint}?sort=balance:desc&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns BAD_REQUEST (400) when pagination limit=0', async () => {
			const response = await api.get(`${endpoint}?sort=balance:desc&limit=0`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('returns a list when given empty limit', async () => {
			const response = await api.get(`${endpoint}?sort=balance:desc&limit=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve accounts based on status', () => {
		it('returns delegate accounts when status is active', async () => {
			const response = await api.get(`${endpoint}?status=active`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns delegate accounts based on multiple statuses', async () => {
			const response = await api.get(`${endpoint}?status=active,standby`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns non-delegate accounts when status is ineligible', async () => {
			const response = await api.get(`${endpoint}?status=ineligible`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Accounts sorted by balance', () => {
		it('returns 10 accounts sorted by balance descending', async () => {
			const response = await api.get(`${endpoint}?sort=balance:desc`);
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

		it('returns 10 accounts sorted by balance ascending', async () => {
			const response = await api.get(`${endpoint}?sort=balance:asc`);
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

	describe('Fetch accounts based on multiple request params', () => {
		it('search \'genesis\' and sort balance descending', async () => {
			const response = await api.get(`${endpoint}?search=genesis&sort=balance:desc`);
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

		it('search \'genesis\' and sort balance ascending', async () => {
			const response = await api.get(`${endpoint}?search=genesis&sort=balance:asc`);
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

		// TODO: Update test blockchain to cover the scenario
		xit('non-delegate accounts, sort balance descending, with limit and offset', async () => {
			const response = await api.get(`${endpoint}?isDelegate=false&sort=balance:desc&limit=5&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
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

		// TODO: Update test blockchain to cover the scenario
		xit('non-delegate accounts, sort balance ascending, with limit and offset', async () => {
			const response = await api.get(`${endpoint}?isDelegate=false&sort=balance:asc&limit=5&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
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

		it('non-delegate accounts with \'active\' status returns 404 NOT FOUND', async () => {
			const expectedStatus = 404;
			const response = await api.get(`${endpoint}?isDelegate=false&status=active`, expectedStatus);
			expect(response).toMap(notFoundSchema);
		});

		it('non-delegate accounts with \'any\' status returns 400 BAD REQUEST', async () => {
			const expectedStatus = 400;
			const response = await api.get(`${endpoint}?isDelegate=false&status=any`, expectedStatus);
			expect(response).toMap(badRequestSchema);
		});
	});
});
