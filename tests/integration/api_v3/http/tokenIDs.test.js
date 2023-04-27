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
	goodRequestSchema,
	badRequestSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	goodResponseSchemaFortokenIDs,
} = require('../../../schemas/api_v3/tokenIDs.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/token/ids`;

describe('Token IDs API', () => {
	it('Should retrieves token ids when called without any params', async () => {
		const response = await api.get(endpoint);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaFortokenIDs);
		expect(response.data.tokenIDs.length).toBeLessThanOrEqual(10);
	});

	it('Should retrieves token ids when called with offset=1', async () => {
		const response = await api.get(`${endpoint}?offset=1`);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaFortokenIDs);
		expect(response.data.tokenIDs.length).toBeLessThanOrEqual(10);
	});

	it('Should retrieves token ids when called with limit=5', async () => {
		const response = await api.get(`${endpoint}?limit=5`);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaFortokenIDs);
		expect(response.data.tokenIDs.length).toBeLessThanOrEqual(5);
	});

	it('Should retrieves token ids when called with offset=1 and limit=5', async () => {
		const response = await api.get(`${endpoint}?offset=1&limit=5`);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaFortokenIDs);
		expect(response.data.tokenIDs.length).toBeLessThanOrEqual(5);
	});

	it('Invalid limit -> bad request', async () => {
		const response = await api.get(`${endpoint}?limit=one`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('Invalid offset -> bad request', async () => {
		const response = await api.get(`${endpoint}?offset=one`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('Invalid request param -> bad request', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
