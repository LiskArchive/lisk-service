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

const { stakesResponseSchema } = require('../../../schemas/api_v3/stakes.schema');
const {
	invalidPublicKeys,
	invalidAddresses,
	invalidNames,
	invalidPartialSearches,
} = require('../constants/invalidInputs');

const endpoint = `${baseUrlV3}/pos/stakes`;

describe('Stakes API', () => {
	let refStaker;
	let refValidator;
	let maxNumberSentStakes;
	beforeAll(async () => {
		let refValidatorAddress;
		const posConstants = await api.get(`${baseUrlV3}/pos/constants`);
		maxNumberSentStakes = posConstants.data.maxNumberSentStakes;

		do {
			const { data: [stakeTx] = [] } = await api.get(
				`${baseUrlV3}/transactions?moduleCommand=pos:stake&limit=1`,
			);
			if (stakeTx) {
				const {
					params: {
						stakes: [stake],
					},
				} = stakeTx;
				refValidatorAddress = stake.validatorAddress;
				refStaker = stakeTx.sender;
			}
		} while (!refStaker);
		const validatorsResponse = await api.get(
			`${baseUrlV3}/pos/validators?address=${refValidatorAddress}`,
		);
		[refValidator] = validatorsResponse.data;
	});

	describe(`GET ${endpoint}`, () => {
		it('should return list of stakes when requested for known staker address', async () => {
			const response = await api.get(`${endpoint}?address=${refStaker.address}`);
			expect(response).toMap(stakesResponseSchema);
			expect(response.data.stakes.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
		});

		it('should return list of stakes when requested with search param (exact staker name)', async () => {
			const response = await api.get(
				`${endpoint}?address=${refStaker.address}&search=${refValidator.name}`,
			);
			expect(response).toMap(stakesResponseSchema);
			expect(response.data.stakes.length).toBe(1);
			expect(response.data.stakes[0].address).toBe(refValidator.address);
		});

		it('should return list of stakes when requested with search param (exact staker public key)', async () => {
			if (refValidator.publicKey) {
				const response = await api.get(
					`${endpoint}?address=${refStaker.address}&search=${refValidator.publicKey}`,
				);
				expect(response).toMap(stakesResponseSchema);
				expect(response.data.stakes.length).toBe(1);
				expect(response.data.stakes[0].address).toBe(refValidator.address);
			}
		});

		it('should return list of stakes when requested with search param (exact staker address)', async () => {
			const response = await api.get(
				`${endpoint}?address=${refStaker.address}&search=${refValidator.address}`,
			);
			expect(response).toMap(stakesResponseSchema);
			expect(response.data.stakes.length).toBe(1);
			expect(response.data.stakes[0].address).toBe(refValidator.address);
		});

		it('should return list of stakes when requested with search param (partial staker name)', async () => {
			const searchParam = refValidator.name ? refValidator.name.substring(0, 3) : '';
			const response = await api.get(
				`${endpoint}?address=${refStaker.address}&search=${searchParam}`,
			);
			expect(response).toMap(stakesResponseSchema);
			expect(response.data.stakes.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
			expect(response.data.stakes.some(staker => staker.address === refValidator.address)).toBe(
				true,
			);
		});

		it('should return list of stakes when requested with search param (partial staker public key)', async () => {
			const searchParam = refValidator.publicKey ? refValidator.publicKey.substring(0, 3) : '';
			const response = await api.get(
				`${endpoint}?address=${refStaker.address}&search=${searchParam}`,
			);
			expect(response).toMap(stakesResponseSchema);
			expect(response.data.stakes.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
			expect(response.data.stakes.some(staker => staker.address === refValidator.address)).toBe(
				true,
			);
		});

		it('should return list of stakes when requested with search param (partial staker address)', async () => {
			const searchParam = refValidator.address ? refValidator.address.substring(0, 3) : '';
			const response = await api.get(
				`${endpoint}?address=${refStaker.address}&search=${searchParam}`,
			);
			expect(response).toMap(stakesResponseSchema);
			expect(response.data.stakes.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
			expect(response.data.stakes.some(staker => staker.address === refValidator.address)).toBe(
				true,
			);
		});

		it('should return list of stakes when requested for known staker publicKey', async () => {
			const response = await api.get(`${endpoint}?publicKey=${refStaker.publicKey}`);
			expect(response).toMap(stakesResponseSchema);
			expect(response.data.stakes.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
		});

		it('should return list of stakes when requested for known staker name', async () => {
			if (refStaker.name) {
				const response = await api.get(`${endpoint}?name=${refStaker.name}`);
				expect(response).toMap(stakesResponseSchema);
				expect(response.data.stakes.length).toBeGreaterThanOrEqual(1);
				expect(response.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
			}
		});

		it('should return bad request if address, publicKey and name is missing', async () => {
			const response = await api.get(endpoint, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should return bad request for invalid address', async () => {
			for (let i = 0; i < invalidAddresses.length; i++) {
				const response = await api.get(`${endpoint}?address=${invalidAddresses[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request for invalid publicKey', async () => {
			for (let i = 0; i < invalidPublicKeys.length; i++) {
				const response = await api.get(`${endpoint}?publicKey=${invalidPublicKeys[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request for invalid name', async () => {
			for (let i = 0; i < invalidNames.length; i++) {
				const response = await api.get(`${endpoint}?name=${invalidNames[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request for invalid search', async () => {
			for (let i = 0; i < invalidPartialSearches.length; i++) {
				const response = await api.get(
					`${endpoint}?address=${refStaker.address}&search=${invalidPartialSearches[i]}`,
					400,
				);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request for invalid param', async () => {
			const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should return bad request for empty param', async () => {
			const response = await api.get(`${endpoint}?invalidParam=`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});
});
