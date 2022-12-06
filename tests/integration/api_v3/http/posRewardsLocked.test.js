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
	goodResponseSchema,
} = require('../../../schemas/api_v3/posRewardsLocked.schema');

const endpoint = `${baseUrlV3}/pos/rewards/locked`;
const stakesEndpoint = `${baseUrlV3}/pos/stakes`;

describe('Rewards Locked API', () => {
	let refStaker;
	beforeAll(async () => {
		let refStakerAddress;
		const stakeTransactionReponse = await api.get(`${baseUrlV3}/transactions?moduleCommand=pos:stake&limit=1`);
		const { stakeTxs = [] } = stakeTransactionReponse.data;
		if (stakeTxs.length) {
			refStakerAddress = stakeTxs[0].sender.address;
		}
		const response2 = await api.get(`${stakesEndpoint}?address=${refStakerAddress}`);
		refStaker = response2.meta.staker;
	});

	it('Returns list of locked rewards with name parameter', async () => {
		const response = await api.get(`${endpoint}?name=${refStaker.name}`);
		expect(response).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of locked rewards with address parameter', async () => {
		const response = await api.get(`${endpoint}?address=${refStaker.address}`);
		expect(response).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of locked rewards with publickKey', async () => {
		const response = await api.get(`${endpoint}?publicKey=${refStaker.publicKey}`);
		expect(response).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('No param -> bad request', async () => {
		const response = await api.get(endpoint, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('Invalid address -> bad request', async () => {
		const response = await api.get(`${endpoint}?address=L`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('Invalid name -> bad request', async () => {
		const response = await api.get(`${endpoint}?name=#`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('Invalid request param -> bad request', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
