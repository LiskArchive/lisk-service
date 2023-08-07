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
const { invalidOffsets, invalidLimits, invalidPublicKeys, invalidNames, invalidAddresses } = require('../constants/invalidInputs');

const endpoint = `${baseUrlV3}/pos/rewards/locked`;
const stakesEndpoint = `${baseUrlV3}/pos/stakes`;

describe('Rewards Locked API', () => {
	let refStaker;
	beforeAll(async () => {
		let refStakerAddress;
		const stakeTransactionResponse = await api.get(`${baseUrlV3}/transactions?moduleCommand=pos:stake&limit=1`);
		const { data: stakeTxs = [] } = stakeTransactionResponse;
		if (stakeTxs.length) {
			refStakerAddress = stakeTxs[0].sender.address;
		}
		const response2 = await api.get(`${stakesEndpoint}?address=${refStakerAddress}`);
		refStaker = response2.meta.staker;
	});

	it('should return list of locked rewards with name parameter', async () => {
		const response = await api.get(`${endpoint}?name=${refStaker.name}`);
		expect(response).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of claimable rewards with known validator name and limit=5', async () => {
		const response = await api.get(`${endpoint}?name=${refStaker.name}&limit=5`);
		expect(response).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(5);
	});

	it('should return list of claimable rewards with known validator name and offset=1', async () => {
		const response = await api.get(`${endpoint}?name=${refStaker.name}&offset=1`);
		expect(response).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of claimable rewards with known validator name, limit=5 and offset=1', async () => {
		const response = await api.get(`${endpoint}?name=${refStaker.name}&limit=5&offset=1`);
		expect(response).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(5);
	});

	it('should return list of locked rewards with address parameter', async () => {
		const response = await api.get(`${endpoint}?address=${refStaker.address}`);
		expect(response).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of claimable rewards with known validator address and limit=5', async () => {
		const response = await api.get(`${endpoint}?address=${refStaker.address}&limit=5`);
		expect(response).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(5);
	});

	it('should return list of claimable rewards with known validator address and offset=1', async () => {
		const response = await api.get(`${endpoint}?address=${refStaker.address}&offset=1`);
		expect(response).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of claimable rewards with known validator address, limit=5 and offset=1', async () => {
		const response = await api.get(`${endpoint}?address=${refStaker.address}&limit=5&offset=1`);
		expect(response).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(5);
	});

	it('should return list of locked rewards with publicKey', async () => {
		if (refStaker.publicKey) {
			const response = await api.get(`${endpoint}?publicKey=${refStaker.publicKey}`);
			expect(response).toMap(goodResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		}
	});

	it('should return list of claimable rewards with known validator publicKey and limit=5', async () => {
		if (refStaker.publicKey) {
			const response = await api.get(`${endpoint}?publicKey=${refStaker.publicKey}&limit=5`);
			expect(response).toMap(goodResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
		}
	});

	it('should return list of claimable rewards with known validator publicKey and offset=1', async () => {
		if (refStaker.publicKey) {
			const response = await api.get(`${endpoint}?publicKey=${refStaker.publicKey}&offset=1`);
			expect(response).toMap(goodResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
		}
	});

	it('should return list of claimable rewards with known validator publicKey, limit=5 and offset=1', async () => {
		if (refStaker.publicKey) {
			const response = await api.get(`${endpoint}?publicKey=${refStaker.publicKey}&limit=5&offset=1`);
			expect(response).toMap(goodResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
		}
	});

	it('should return bad request if requested without any param', async () => {
		const response = await api.get(endpoint, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request if requested with invalid address', async () => {
		for (let i = 0; i < invalidAddresses.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await api.get(`${endpoint}?address=${invalidAddresses}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request if requested with invalid name', async () => {
		for (let i = 0; i < invalidNames.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await api.get(`${endpoint}?name=${invalidNames[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request if requested with invalid publicKey', async () => {
		for (let i = 0; i < invalidPublicKeys.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await api.get(`${endpoint}?publicKey=${invalidPublicKeys[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request if requested with invalid limit', async () => {
		for (let i = 0; i < invalidLimits.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await api.get(`${endpoint}?address=${refStaker.address}&limit=${invalidLimits[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request if requested with invalid offset', async () => {
		for (let i = 0; i < invalidOffsets.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await api.get(`${endpoint}?address=${refStaker.address}&offset=${invalidOffsets[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request if requested with invalid param', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request if requested with empty invalid param', async () => {
		const response = await api.get(`${endpoint}?invalidParam=`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
