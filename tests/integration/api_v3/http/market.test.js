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
	goodRequestSchema,
	badRequestSchema,
	serviceUnavailableSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	marketPriceSchema,
	marketPriceMetaSchema,
} = require('../../../schemas/api_v3/marketPrice.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/market/prices`;

describe('Market API', () => {
	describe('Retrieve prices', () => {
		it('returns market prices or 503 SERVICE UNAVAILABLE', async () => {
			try {
				const response = await api.get(`${endpoint}`);
				expect(response).toMap(goodRequestSchema);
				expect(response.data).toBeInstanceOf(Array);
				expect(response.data.length).toBeGreaterThanOrEqual(1);
				response.data.forEach(account => expect(account).toMap(marketPriceSchema));
				expect(response.meta).toMap(marketPriceMetaSchema);
			} catch (_) {
				const expectedResponseCode = 503;
				const response = await api.get(`${endpoint}`, expectedResponseCode);
				expect(response).toMap(serviceUnavailableSchema);
			}
		});

		it('returns 400 BAD REQUEST with params', async () => {
			const expectedResponseCode = 400;
			const response = await api.get(`${endpoint}?limit=10`, expectedResponseCode);
			expect(response).toMap(badRequestSchema);
		});
	});
});
