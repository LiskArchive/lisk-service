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
	metaSchema,
	wrongInputParamSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	supportedTokensSchema,
	goodRequestSchemaForSupportedTokens,
} = require('../../../schemas/api_v3/tokens.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/tokens/supported`;

describe('Supported Tokens API', () => {
	it('retrieves list of supported tokens -> ok', async () => {
		const response = await api.get(endpoint);
		expect(response).toMap(goodRequestSchemaForSupportedTokens);
		expect(response.data.supportedTokens).toBeInstanceOf(Array);
		expect(response.data.supportedTokens.length).toBeLessThanOrEqual(10);
		expect(response.data).toMap(supportedTokensSchema);
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves list of supported tokens with limit=5 -> ok', async () => {
		const response = await api.get(`${endpoint}?limit=5`);
		expect(response).toMap(goodRequestSchemaForSupportedTokens);
		expect(response.data.supportedTokens).toBeInstanceOf(Array);
		expect(response.data.supportedTokens.length).toBeLessThanOrEqual(5);
		expect(response.data).toMap(supportedTokensSchema);
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves list of supported tokens with limit=5 and offset=1-> ok', async () => {
		const response = await api.get(`${endpoint}?limit=5&offset=1`);
		expect(response).toMap(goodRequestSchemaForSupportedTokens);
		expect(response.data.supportedTokens).toBeInstanceOf(Array);
		expect(response.data.supportedTokens.length).toBeLessThanOrEqual(5);
		expect(response.data).toMap(supportedTokensSchema);
		expect(response.meta).toMap(metaSchema);
	});

	it('invalid query parameter -> 400', async () => {
		const response = await api.get(`${endpoint}?limit=-5`, 400);
		expect(response).toMap(wrongInputParamSchema);
	});

	it('invalid request param -> bad request', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
