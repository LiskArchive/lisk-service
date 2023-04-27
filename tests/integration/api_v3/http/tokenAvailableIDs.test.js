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

const {
	badRequestSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	goodResponseSchemaFortokenAvailableIDs,
} = require('../../../schemas/api_v3/tokenAvailableIDs.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/token/available-ids`;

describe('Token IDs API', () => {
	it('should retrieves available token ids when called without any params', async () => {
		const response = await api.get(endpoint);
		expect(response).toMap(goodResponseSchemaFortokenAvailableIDs);
		expect(response.data.tokenIDs.length).toBeGreaterThanOrEqual(1);
		expect(response.data.tokenIDs.length).toBeLessThanOrEqual(10);
	});

	it('should retrieves available token ids when called with offset=1', async () => {
		const response = await api.get(`${endpoint}?offset=1`);
		expect(response).toMap(goodResponseSchemaFortokenAvailableIDs);
		expect(response.data.tokenIDs.length).toBeGreaterThanOrEqual(0);
		expect(response.data.tokenIDs.length).toBeLessThanOrEqual(10);
	});

	it('should retrieves available token ids when called with limit=5', async () => {
		const response = await api.get(`${endpoint}?limit=5`);
		expect(response).toMap(goodResponseSchemaFortokenAvailableIDs);
		expect(response.data.tokenIDs.length).toBeGreaterThanOrEqual(1);
		expect(response.data.tokenIDs.length).toBeLessThanOrEqual(5);
	});

	it('should retrieves available token ids when called with offset=1 and limit=5', async () => {
		const response = await api.get(`${endpoint}?offset=1&limit=5`);
		expect(response).toMap(goodResponseSchemaFortokenAvailableIDs);
		expect(response.data.tokenIDs.length).toBeGreaterThanOrEqual(0);
		expect(response.data.tokenIDs.length).toBeLessThanOrEqual(5);
	});

	it('should return bad request when called with Invalid limit', async () => {
		const response = await api.get(`${endpoint}?limit=one`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request when called with Invalid offset', async () => {
		const response = await api.get(`${endpoint}?offset=one`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return Invalid request param when called with invalid param', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
