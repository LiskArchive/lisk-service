/* eslint-disable quote-props */
/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	marketPriceSchema,
} = require('../../../schemas/api_v2/marketPrice.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;
const endpoint = `${baseUrlV2}/market/prices`;

describe('Market API', () => {
	xdescribe('Retrieve prices', () => {
		it('returns market prices', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(account => expect(account).toMap(marketPriceSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 400 BAD REQUEST with params', async () => {
			const response = await api.get(`${endpoint}?limit=10`);
			expect(response).toMap(badRequestSchema);
		});
	});
});
