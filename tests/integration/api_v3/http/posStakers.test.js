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

const { badRequestSchema } = require('../../../schemas/httpGenerics.schema');
const { goodRequestSchema } = require('../../../schemas/api_v3/staker.schema');

const endpoint = `${baseUrlV3}/pos/stakers`;

describe('Stakers API', () => {
	let refValidator;
	let refStaker;
	beforeAll(async () => {
		let refValidatorAddress;
		do {
			// eslint-disable-next-line no-await-in-loop
			const { data: [stakeTx] = [] } = await api.get(`${baseUrlV3}/transactions?moduleCommand=pos:stake&limit=1`);
			if (stakeTx) {
				// Destructure to refer first entry of all the sent votes within the transaction
				const { params: { stakes: [stake] } } = stakeTx;
				refValidatorAddress = stake.validatorAddress;
				refStaker = stakeTx.sender;
			}
		} while (!refValidatorAddress);
		const validatorsResponse = await api.get(`${baseUrlV3}/pos/validators?address=${refValidatorAddress}`);
		[refValidator] = validatorsResponse.data;
	});

	describe(`GET ${endpoint}`, () => {
		it('Returns list of stakers when requested for known validator address', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of stakers when requested for known validator address and search param (exact staker name)', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}&search=${refStaker.name}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBe(1);
		});

		it('Returns list of stakers when requested for known validator address and search param (partial staker name)', async () => {
			const searchParam = refStaker.name ? refStaker.name[0] : '';
			const response = await api.get(`${endpoint}?address=${refValidator.address}&search=${searchParam}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of stakers when requested with known validator address and offset=1', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of stakers when requested with known validator address and limit=5', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}&limit=5`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of stakers when requested with known validator address, offset=1 and limit=5', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}&offset=1&limit=5`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(0);
			expect(response.data.stakers.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of stakers when requested for known validator publicKey', async () => {
			const response = await api.get(`${endpoint}?publicKey=${refValidator.publicKey}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of stakers when requested with known validator publicKey and offset=1', async () => {
			const response = await api.get(`${endpoint}?publicKey=${refValidator.publicKey}&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of stakers when requested with known validator publicKey and limit=5', async () => {
			const response = await api.get(`${endpoint}?publicKey=${refValidator.publicKey}&limit=5`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of stakers when requested with known validator publicKey, offset=1 and limit=5', async () => {
			const response = await api.get(`${endpoint}?publicKey=${refValidator.publicKey}&offset=1&limit=5`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(0);
			expect(response.data.stakers.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of stakers when requested for known validator name', async () => {
			const response = await api.get(`${endpoint}?name=${refValidator.name}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of stakers when requested with known validator name and offset=1', async () => {
			const response = await api.get(`${endpoint}?name=${refValidator.name}&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of stakers when requested with known validator name and limit=5', async () => {
			const response = await api.get(`${endpoint}?name=${refValidator.name}&limit=5`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of stakers when requested with known validator name, offset=1 and limit=5', async () => {
			const response = await api.get(`${endpoint}?name=${refValidator.name}&offset=1&limit=5`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(0);
			expect(response.data.stakers.length).toBeLessThanOrEqual(5);
		});

		it('Returns empty when requested for known non-validator address', async () => {
			const response = await api.get(`${endpoint}?address=lsk99999999999999999999999999999999999999`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBe(0);
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
