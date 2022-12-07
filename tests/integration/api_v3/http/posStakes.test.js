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
	stakeResponseSchema,
} = require('../../../schemas/api_v3/stake.schema');

const endpoint = `${baseUrlV3}/pos/stakes`;

describe('Stakes API', () => {
	let refValidator;
	let maxNumberSentStakes;
	beforeAll(async () => {
		const posConstants = await api.get(`${baseUrlV3}/pos/constants`);
		maxNumberSentStakes = posConstants.data.maxNumberSentStakes;

		do {
			// eslint-disable-next-line no-await-in-loop
			const { data: [stakeTx] = [] } = await api.get(`${baseUrlV3}/transactions?moduleCommand=pos:stake&limit=1`);
			if (stakeTx) {
				refValidator = stakeTx.sender;
			}
		} while (!refValidator);
	});

	describe(`GET ${endpoint}`, () => {
		it('Returns list of sent stakes when requested for known staker address', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}`);
			expect(response).toMap(stakeResponseSchema);
			expect(response.data.stakes.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
		});

		it('Returns list of sent stakes when requested for known staker name', async () => {
			const response = await api.get(`${endpoint}?name=${refValidator.name}`);
			expect(response).toMap(stakeResponseSchema);
			expect(response.data.stakes.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
		});

		it('Returns list of sent stakes when requested for known staker publicKey', async () => {
			const response = await api.get(`${endpoint}?publicKey=${refValidator.publicKey}`);
			expect(response).toMap(stakeResponseSchema);
			expect(response.data.stakes.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
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
