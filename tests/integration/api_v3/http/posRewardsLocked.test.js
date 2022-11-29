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

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;

const {
	badRequestSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	goodResponseSchema,
} = require('../../../schemas/api_v3/posRewardsLocked.schema');

const endpoint = `${baseUrlV3}/pos/rewards/locked`;

describe('Rewards Locked API', () => {
	it('Returns list locked rewards with name parameter', async () => {
		const response = await api.get(`${endpoint}?name=test`);
		expect(response).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('Returns list locked rewards with address parameter', async () => {
		const response = await api.get(`${endpoint}?address=lskaeec6426y8mkoq4oqgf5g4fsau738gb697pj8q`);
		expect(response).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('Returns list locked rewards with name publickKey', async () => {
		const response = await api.get(`${endpoint}?publicKey=9bae3da048d24db845f02772ced2791e0b269063ac2c3e30010ed6623726dbc4`);
		expect(response).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('No address -> bad request', async () => {
		const response = await api.get(endpoint, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('invalid address -> bad request', async () => {
		const response = await api.get(`${endpoint}?address=L`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('invalid name -> bad name', async () => {
		const response = await api.get(`${endpoint}?name=#`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it.only('invalid request param -> bad request', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
