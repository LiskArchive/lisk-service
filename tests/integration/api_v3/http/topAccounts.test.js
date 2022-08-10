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
	badRequestSchema,
	goodRequestSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	topAccountsSchema,
	topAccountsMetaSchema,
} = require('../../../schemas/api_v3/topAccounts.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/tokens/lsk/top`;

// TODO: Enable when test blockchain has accounts with balances
xdescribe('Top accounts API', () => {
	it('retrieves lisk top accounts list', async () => {
		const response = await api.get(endpoint);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.forEach(account => expect(account).toMap(topAccountsSchema));
		if (response.data.length > 1) {
			for (let i = 1; i < response.data.length; i++) {
				const prevAccount = response.data[i - 1];
				const currAccount = response.data[i];
				expect(BigInt(prevAccount.balance)).toBeGreaterThanOrEqual(BigInt(currAccount.balance));
			}
		}
		expect(response.meta).toMap(topAccountsMetaSchema);
	});

	it('retrieves lisk top accounts list with limit=5', async () => {
		const response = await api.get(`${endpoint}?limit=5`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(5);
		response.data.forEach(account => expect(account).toMap(topAccountsSchema));
		if (response.data.length > 1) {
			for (let i = 1; i < response.data.length; i++) {
				const prevAccount = response.data[i - 1];
				const currAccount = response.data[i];
				expect(BigInt(prevAccount.balance)).toBeGreaterThanOrEqual(BigInt(currAccount.balance));
			}
		}
		expect(response.meta).toMap(topAccountsMetaSchema);
	});

	it('retrieves lisk top accounts list with limit=5 & offset=1', async () => {
		const response = await api.get(`${endpoint}?limit=5&offset=1`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(5);
		response.data.forEach(account => expect(account).toMap(topAccountsSchema));
		if (response.data.length > 1) {
			for (let i = 1; i < response.data.length; i++) {
				const prevAccount = response.data[i - 1];
				const currAccount = response.data[i];
				expect(BigInt(prevAccount.balance)).toBeGreaterThanOrEqual(BigInt(currAccount.balance));
			}
		}
		expect(response.meta).toMap(topAccountsMetaSchema);
	});

	it('retrieves lisk top accounts list with limit=5, offset=1 & sort=balance:asc', async () => {
		const response = await api.get(`${endpoint}?limit=5&offset=1&sort=balance:asc`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(5);
		response.data.forEach(account => expect(account).toMap(topAccountsSchema));
		if (response.data.length > 1) {
			for (let i = 1; i < response.data.length; i++) {
				const prevAccount = response.data[i - 1];
				const currAccount = response.data[i];
				expect(BigInt(prevAccount.balance)).toBeLessThanOrEqual(BigInt(currAccount.balance));
			}
		}
		expect(response.meta).toMap(topAccountsMetaSchema);
	});

	it('invalid request param -> bad request', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
