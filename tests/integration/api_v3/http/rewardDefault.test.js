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
	rewardDefaultResponseSchema,
} = require('../../../schemas/api_v3/rewardDefault.schema');

const endpoint = `${baseUrlV3}/reward/default`;

describe('Reward Default API', () => {
	describe(`GET ${endpoint}`, () => {
		it('should return default reward when requested with block height=1', async () => {
			const response = await api.get(`${endpoint}?height=1`);
			expect(response).toMap(rewardDefaultResponseSchema);
		});

		it('should return bad request for missing height', async () => {
			const response = await api.get(endpoint, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should return bad request for a height less than 0', async () => {
			const response = await api.get(`${endpoint}?height=-1`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should return bad request for a non-integer height', async () => {
			const response = await api.get(`${endpoint}?height=abc`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should return bad request for a invalid param', async () => {
			const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});
});
