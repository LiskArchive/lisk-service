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
const { invalidOffsets, invalidLimits, invalidNames, invalidPublicKeys, invalidAddresses, invalidPartialSearches } = require('../constants/invalidInputs');

const endpoint = `${baseUrlV3}/pos/stakers`;

describe('Stakers API', () => {
	let refValidator;
	beforeAll(async () => {
		let refValidatorAddress;
		do {
			// eslint-disable-next-line no-await-in-loop
			const { data: [stakeTx] = [] } = await api.get(`${baseUrlV3}/transactions?moduleCommand=pos:stake&limit=1`);
			if (stakeTx) {
				// Destructure to refer first entry of all the sent votes within the transaction
				const { params: { stakes: [stake] } } = stakeTx;
				refValidatorAddress = stake.validatorAddress;
			}
		} while (!refValidatorAddress);
		const validatorsResponse = await api.get(`${baseUrlV3}/pos/validators?address=${refValidatorAddress}`);
		[refValidator] = validatorsResponse.data;
	});

	describe(`GET ${endpoint}`, () => {
		it('should return list of stakers when requested for known validator address', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(10);
		});

		xit('should return list of stakers when requested for known validator address and search param (exact staker name)', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}&search=${refValidator.name}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBe(1);
			expect(response.data.stakers[0].address).toBe(refValidator.address);
		});

		xit('should return list of stakers when requested for known validator address and search param (exact staker address)', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}&search=${refValidator.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBe(1);
			expect(response.data.stakers[0].address).toBe(refValidator.address);
		});

		xit('should return list of stakers when requested for known validator address and search param (exact staker public key)', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}&search=${refValidator.publicKey}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBe(1);
			expect(response.data.stakers[0].address).toBe(refValidator.address);
		});

		xit('should return list of stakers when requested for known validator address and search param (partial staker name)', async () => {
			const searchParam = refValidator.name ? refValidator.name.substring(0, 3) : '';
			const response = await api.get(`${endpoint}?address=${refValidator.address}&search=${searchParam}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(10);
			expect(response.data.stakers.some(staker => staker.address === refValidator.address))
				.toBe(true);
		});

		xit('should return list of stakers when requested for known validator address and search param (partial staker address)', async () => {
			const searchParam = refValidator.address ? refValidator.address.substring(0, 3) : '';
			const response = await api.get(`${endpoint}?address=${refValidator.address}&search=${searchParam}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(10);
			expect(response.data.stakers.some(staker => staker.address === refValidator.address))
				.toBe(true);
		});

		xit('should return list of stakers when requested for known validator address and search param (partial staker public key)', async () => {
			const searchParam = refValidator.publicKey ? refValidator.publicKey.substring(0, 3) : '';
			const response = await api.get(`${endpoint}?address=${refValidator.address}&search=${searchParam}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(10);
			expect(response.data.stakers.some(staker => staker.address === refValidator.address))
				.toBe(true);
		});

		it('should return list of stakers when requested with known validator address and offset=1', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(0);
			expect(response.data.stakers.length).toBeLessThanOrEqual(10);
		});

		it('should return list of stakers when requested with known validator address and limit=5', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}&limit=5`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(5);
		});

		it('should return list of stakers when requested with known validator address, offset=1 and limit=5', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}&offset=1&limit=5`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(0);
			expect(response.data.stakers.length).toBeLessThanOrEqual(5);
		});

		it('should return list of stakers when requested for known validator publicKey', async () => {
			const response = await api.get(`${endpoint}?publicKey=${refValidator.publicKey}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(10);
		});

		it('should return list of stakers when requested with known validator publicKey and offset=1', async () => {
			const response = await api.get(`${endpoint}?publicKey=${refValidator.publicKey}&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(0);
			expect(response.data.stakers.length).toBeLessThanOrEqual(10);
		});

		it('should return list of stakers when requested with known validator publicKey and limit=5', async () => {
			const response = await api.get(`${endpoint}?publicKey=${refValidator.publicKey}&limit=5`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(5);
		});

		it('should return list of stakers when requested with known validator publicKey, offset=1 and limit=5', async () => {
			const response = await api.get(`${endpoint}?publicKey=${refValidator.publicKey}&offset=1&limit=5`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(0);
			expect(response.data.stakers.length).toBeLessThanOrEqual(5);
		});

		it('should return list of stakers when requested for known validator name', async () => {
			const response = await api.get(`${endpoint}?name=${refValidator.name}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(10);
		});

		it('should return list of stakers when requested with known validator name and offset=1', async () => {
			const response = await api.get(`${endpoint}?name=${refValidator.name}&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(0);
			expect(response.data.stakers.length).toBeLessThanOrEqual(10);
		});

		it('should return list of stakers when requested with known validator name and limit=5', async () => {
			const response = await api.get(`${endpoint}?name=${refValidator.name}&limit=5`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(response.data.stakers.length).toBeLessThanOrEqual(5);
		});

		it('should return list of stakers when requested with known validator name, offset=1 and limit=5', async () => {
			const response = await api.get(`${endpoint}?name=${refValidator.name}&offset=1&limit=5`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBeGreaterThanOrEqual(0);
			expect(response.data.stakers.length).toBeLessThanOrEqual(5);
		});

		it('should return empty list when requested with invalid address and publicKey pair', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}&publicKey=796c94fe1e53c4dd63f5a181450811aa53bfc38dcad038c1b884e8cb45e26823`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBe(0);
		});

		it('should return empty when requested for known non-validator address', async () => {
			const response = await api.get(`${endpoint}?address=lsk99999999999999999999999999999999999999`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.stakers.length).toBe(0);
		});

		it('should return bad request if address, publicKey and name is missing', async () => {
			const response = await api.get(endpoint, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should return bad request for invalid address', async () => {
			for (let i = 0; i < invalidAddresses.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await api.get(`${endpoint}?address=${invalidAddresses[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request for invalid publicKey', async () => {
			for (let i = 0; i < invalidPublicKeys.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await api.get(`${endpoint}?publicKey=${invalidPublicKeys[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request for invalid name', async () => {
			for (let i = 0; i < invalidNames.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await api.get(`${endpoint}?name=${invalidNames[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request for invalid search', async () => {
			for (let i = 0; i < invalidPartialSearches.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await api.get(`${endpoint}?address=${refValidator.address}&search=${invalidPartialSearches[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request for invalid limit', async () => {
			for (let i = 0; i < invalidLimits.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await api.get(`${endpoint}?address=${refValidator.address}&limit=${invalidLimits[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request for invalid offset', async () => {
			for (let i = 0; i < invalidOffsets.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await api.get(`${endpoint}?address=${refValidator.address}&offset=${invalidOffsets[i]}`, 400);
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
