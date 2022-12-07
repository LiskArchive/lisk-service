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
	stakesResponseSchema,
} = require('../../../schemas/api_v3/stakes.schema');

const endpoint = `${baseUrlV3}/pos/stakes`;

describe('Stakes API', () => {
	let refValidator;
	beforeAll(async () => {
		let response;
		do {
			// eslint-disable-next-line no-await-in-loop
			response = await api.get(`${baseUrlV3}/dpos/delegates?limit=1`);
		} while (!response.data);
		[refValidator] = response.data;
	});

	// TODO: Add missing tests similar to stakers
	describe(`GET ${endpoint}`, () => {
		it('Returns list of sent stakes when requested for known staker address', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}`);
			expect(response).toMap(stakesResponseSchema);
			expect(response.data.votes.length).toBeGreaterThanOrEqual(1);
			expect(response.data.votes.length).toBeLessThanOrEqual(10);
		});

		// TODO: Remove
		it('Returns list of sent stakes when requested for known staker address and limit=5', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}&limit=5`);
			expect(response).toMap(stakesResponseSchema);
			expect(response.data.votes.length).toBeGreaterThanOrEqual(1);
			expect(response.data.votes.length).toBeLessThanOrEqual(5);
		});

		// TODO: Remove
		it('Returns list of sent stakes when requested for known staker address, limit=5 and offset=1', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}&limit=5&offset=1`);
			expect(response).toMap(stakesResponseSchema);
			expect(response.data.votes.length).toBeGreaterThanOrEqual(1);
			expect(response.data.votes.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of sent stakes when requested for known staker name', async () => {
			if (refValidator.name) {
				const response = await api.get(`${endpoint}?name=${refValidator.name}`);
				expect(response).toMap(stakesResponseSchema);
				expect(response.data.votes.length).toBeGreaterThanOrEqual(1);
				expect(response.data.votes.length).toBeLessThanOrEqual(10);
			}
		});

		it('No address -> bad request', async () => {
			const response = await api.get(endpoint, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('Invalid address -> bad request', async () => {
			const response = await api.get(`${endpoint}?address=address=L`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('Invalid request param -> bad request', async () => {
			const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});
});
