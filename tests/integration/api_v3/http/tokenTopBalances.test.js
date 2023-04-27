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

const { badRequestSchema, goodRequestSchema } = require('../../../schemas/httpGenerics.schema');

const {
	goodResponseSchemaForTokenTopBalances,
} = require('../../../schemas/api_v3/tokenTopBalances.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/token/balances/top`;
const tokenID = "0400000000000000";

describe('Tokens top balances API', () => {
	it('Should retrieves token top balances when queried with token ID', async () => {
		const response = await api.get(`${endpoint}?tokenID=${tokenID}`);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaForTokenTopBalances);
		expect(response.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('Should retrieves token info when called with offset=1', async () => {
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&offset=1`);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaForTokenTopBalances);
		expect(response.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('Should retrieves token info when called with limit=5', async () => {
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&limit=5`);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaForTokenTopBalances);
		expect(response.data[tokenID].length).toBeLessThanOrEqual(5);
	});

	it('Should retrieves token info when called with offset=1 and limit=5', async () => {
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&offset=1&limit=5`);
		expect(response).toMap(goodRequestSchema);
		expect(response).toMap(goodResponseSchemaForTokenTopBalances);
		expect(response.data[tokenID].length).toBeLessThanOrEqual(5);
	});

    it('No tokenID -> bad request', async () => {
        const response = await api.get(endpoint, 400);
        expect(response).toMap(badRequestSchema);
    });

	it('Invalid limit -> bad request', async () => {
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&limit=one`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('Invalid offset -> bad request', async () => {
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&offset=one`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('Invalid request param -> bad request', async () => {
		const response = await api.get(`${endpoint}?tokenID=${tokenID}&invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
