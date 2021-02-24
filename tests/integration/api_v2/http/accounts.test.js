/* eslint-disable quote-props */
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
} = require('../../../schemas/account.schema');

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
			// expect(response.data.length).toEqual(10);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
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
			const url = `${endpoint}?publickey=`;
			const response = await api.get(url);
			expect(response).toMap(goodRequestSchema);
			// expect(response.data).toBeArrayOfSize(10);
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
		it('known address by publickey', async () => {
			const url = `${endpoint}?publickey=${delegate.summary.publicKey}`;
			const expectedStatus = 200;
			const response = await api.get(url, expectedStatus);
			expect(response.data.length).toEqual(1);
			expect(response).toMap(goodRequestSchema);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid publicKey -> 400', async () => {
			const url = `${endpoint}?publickey=invalid_pk`;
			const expectedStatus = 400;
			const response = await api.get(url, expectedStatus);
			expect(response).toMap(badRequestSchema);
		});

		it('empty public key parameter returns a default list', async () => {
			const url = `${endpoint}?publickey=`;
			const response = await api.get(url);
			expect(response).toMap(goodRequestSchema);
			// expect(response.data).toBeArrayOfSize(10);
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
			// expect(response.data).toBeArrayOfSize(100);
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
			// expect(response.data).toBeArrayOfSize(10);
			response.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			expect(response.meta).toMap(metaSchema);
		});
	});
});
