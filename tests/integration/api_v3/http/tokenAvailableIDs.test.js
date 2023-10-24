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

const { badRequestSchema } = require('../../../schemas/httpGenerics.schema');

const {
	goodResponseSchemaForTokenAvailableIDs,
} = require('../../../schemas/api_v3/tokenAvailableIDs.schema');
const { invalidLimits, invalidOffsets } = require('../constants/invalidInputs');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/token/available-ids`;

describe('Token IDs API', () => {
	it('should retrieve available token ids when called without any params', async () => {
		const response = await api.get(endpoint);
		expect(response).toMap(goodResponseSchemaForTokenAvailableIDs);
		expect(response.data.tokenIDs.length).toBeGreaterThanOrEqual(1);
		expect(response.data.tokenIDs.length).toBeLessThanOrEqual(10);
	});

	it('should retrieve available token ids when called with sort=tokenID:asc', async () => {
		const response = await api.get(`${endpoint}?sort=tokenID:asc`);
		expect(response).toMap(goodResponseSchemaForTokenAvailableIDs);
		expect(response.data.tokenIDs.length).toBeGreaterThanOrEqual(1);
		expect(response.data.tokenIDs.length).toBeLessThanOrEqual(10);

		const isSortedAscending = response.data.tokenIDs.every((tokenID, index) => {
			if (index === 0) return true;
			return tokenID.localeCompare(response.data.tokenIDs[index - 1], 'en') > 0;
		});
		expect(isSortedAscending).toBe(true);
	});

	it('should retrieve available token ids when called with sort=tokenID:desc', async () => {
		const response = await api.get(`${endpoint}?sort=tokenID:desc`);
		expect(response).toMap(goodResponseSchemaForTokenAvailableIDs);
		expect(response.data.tokenIDs.length).toBeGreaterThanOrEqual(1);
		expect(response.data.tokenIDs.length).toBeLessThanOrEqual(10);

		const isSortedDescending = response.data.tokenIDs.every((tokenID, index) => {
			if (index === 0) return true;
			return tokenID.localeCompare(response.data.tokenIDs[index - 1], 'en') < 0;
		});
		expect(isSortedDescending).toBe(true);
	});

	it('should retrieve available token ids when called with offset=1', async () => {
		const response = await api.get(`${endpoint}?offset=1`);
		expect(response).toMap(goodResponseSchemaForTokenAvailableIDs);
		expect(response.data.tokenIDs.length).toBeGreaterThanOrEqual(0);
		expect(response.data.tokenIDs.length).toBeLessThanOrEqual(10);
	});

	it('should retrieve available token ids when called with limit=5', async () => {
		const response = await api.get(`${endpoint}?limit=5`);
		expect(response).toMap(goodResponseSchemaForTokenAvailableIDs);
		expect(response.data.tokenIDs.length).toBeGreaterThanOrEqual(1);
		expect(response.data.tokenIDs.length).toBeLessThanOrEqual(5);
	});

	it('should retrieve available token ids when called with offset=1 and limit=5', async () => {
		const response = await api.get(`${endpoint}?offset=1&limit=5`);
		expect(response).toMap(goodResponseSchemaForTokenAvailableIDs);
		expect(response.data.tokenIDs.length).toBeGreaterThanOrEqual(0);
		expect(response.data.tokenIDs.length).toBeLessThanOrEqual(5);
	});

	it('should return bad request when called with invalid limit', async () => {
		for (let i = 0; i < invalidLimits.length; i++) {
			const response = await api.get(`${endpoint}?limit=${invalidLimits[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request when called with invalid offset', async () => {
		for (let i = 0; i < invalidOffsets.length; i++) {
			const response = await api.get(`${endpoint}?offset=${invalidOffsets[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return invalid request param when called with invalid param', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return invalid request param when called with empty invalid param', async () => {
		const response = await api.get(`${endpoint}?invalidParam=`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request when called with invalid sort', async () => {
		const response = await api.get(`${endpoint}?sort=token:desc`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
