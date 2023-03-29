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

const { badRequestSchema } = require('../../../schemas/httpGenerics.schema');

const {
	tokensSummaryResponseSchema,
	goodResponseSchema,
	tokensSummaryMetaResponseSchema,
} = require('../../../schemas/api_v3/tokenSummary.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/token/summary`;

describe('Tokens API', () => {
	it('Retrieves tokens summary -> ok', async () => {
		const response = await api.get(endpoint);
		expect(response).toMap(goodResponseSchema);
		expect(response.data).toBeInstanceOf(Object);
		expect(response.data).toMap(tokensSummaryResponseSchema);
		expect(response.meta).toMap(tokensSummaryMetaResponseSchema);
	});

	it('Invalid request param -> bad request', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});
});

