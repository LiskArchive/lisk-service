/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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

const { badRequestSchema, goodRequestSchema } = require('../../../schemas/httpGenerics.schema');

const {
	goodResponseSchemaForTokenTopBalances,
} = require('../../../schemas/api_v3/tokenTopBalances.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/token/balances/top`;

describe('Tokens top balances API', () => {
	let tokenID;
	let tokenInfo;

	beforeAll(async () => {
		const res = await api.get(`${baseUrlV3}/token/available-ids`);
		[tokenID] = res.data.tokenIDs;

		const { data: tokenInformation } = await api.get(`${endpoint}?tokenID=${tokenID}`);
		[tokenInfo] = tokenInformation[tokenID];
	});

	it('should retrieve top token balances when called with token ID', async () => {
		const response = await api.get(`${endpoint}?tokenID=${tokenID}`);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaForTokenTopBalances);
		expect(response.data[tokenID].length).toBeGreaterThanOrEqual(1);
		expect(response.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('should retrieve top token balances when called with token ID and offset=1', async () => {
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&offset=1`);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaForTokenTopBalances);
		expect(response.data[tokenID].length).toBeGreaterThanOrEqual(0);
		expect(response.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('should retrieve top token balances when called with token ID and limit=5', async () => {
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&limit=5`);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaForTokenTopBalances);
		expect(response.data[tokenID].length).toBeGreaterThanOrEqual(1);
		expect(response.data[tokenID].length).toBeLessThanOrEqual(5);
	});

	it('should retrieve top token balances when called with token ID, offset=1 and limit=5', async () => {
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&offset=1&limit=5`);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaForTokenTopBalances);
		expect(response.data[tokenID].length).toBeGreaterThanOrEqual(0);
		expect(response.data[tokenID].length).toBeLessThanOrEqual(5);
	});

	it('should retrieve top token balances when called with token ID and search param (partial name)', async () => {
		const searchParam = tokenInfo.name ? tokenInfo.name.substring(0, 3) : '';
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&search=${searchParam}`);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaForTokenTopBalances);
		expect(response.data[tokenID].length).toBeGreaterThanOrEqual(1);
		expect(response.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('should retrieve top token balances when called with token ID and search param (partial address)', async () => {
		const searchParam = tokenInfo.address ? tokenInfo.address.substring(0, 3) : '';
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&search=${searchParam}`);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaForTokenTopBalances);
		expect(response.data[tokenID].length).toBeGreaterThanOrEqual(1);
		expect(response.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('should retrieve top token balances when called with token ID and search param (partial public key)', async () => {
		const searchParam = tokenInfo.publicKey ? tokenInfo.publicKey.substring(0, 3) : '';
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&search=${searchParam}`);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaForTokenTopBalances);
		expect(response.data[tokenID].length).toBeGreaterThanOrEqual(1);
		expect(response.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('should retrieve top token balances when called with token ID and search param (exact name)', async () => {
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&search=${tokenInfo.name}`);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaForTokenTopBalances);
		expect(response.data[tokenID].length).toBeGreaterThanOrEqual(1);
		expect(response.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('should retrieve top token balances when called with token ID and search param (exact address)', async () => {
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&search=${tokenInfo.address}`);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaForTokenTopBalances);
		expect(response.data[tokenID].length).toBeGreaterThanOrEqual(1);
		expect(response.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('should retrieve top token balances when called with token ID and search param (exact public key)', async () => {
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&search=${tokenInfo.publicKey}`);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaForTokenTopBalances);
		expect(response.data[tokenID].length).toBeGreaterThanOrEqual(1);
		expect(response.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('should return bad request when called without token ID', async () => {
		const response = await api.get(endpoint, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request when called with Invalid limit', async () => {
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&limit=one`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request when called with Invalid offset', async () => {
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&offset=one`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request when called with invalid param', async () => {
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
