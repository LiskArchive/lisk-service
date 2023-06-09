/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const {
	address: {
		getAddressFromLisk32Address,
	},
} = require('@liskhq/lisk-cryptography');

const config = require('../../../config');
const { api } = require('../../../helpers/api');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;

const { badRequestSchema } = require('../../../schemas/httpGenerics.schema');
const { validatorsResponseSchema } = require('../../../schemas/api_v3/posValidators.schema');

const endpoint = `${baseUrlV3}/pos/validators`;

describe('pos/validators API', () => {
	let numberActiveValidators;
	let numberStandbyValidators;
	let refGenerators;

	beforeAll(async () => {
		const response = await api.get(`${baseUrlV3}/pos/constants`);
		numberActiveValidators = response.data.numberActiveValidators;
		numberStandbyValidators = response.data.numberStandbyValidators;

		const generatorsResponse = await api.get(`${baseUrlV3}/generators?limit=10`);
		refGenerators = generatorsResponse.data;
	});

	describe(`GET ${endpoint}`, () => {
		it('should return list of validators when requested', async () => {
			const response = await api.get(`${endpoint}?limit=${numberActiveValidators + numberStandbyValidators}`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length)
				.toBeLessThanOrEqual(numberActiveValidators + numberStandbyValidators);
		});

		it('should return list of correctly sorted validators when called with sort=validatorWeight:desc', async () => {
			const response = await api.get(`${endpoint}?sort=validatorWeight:desc`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);

			// Sort validators by rank to check validate weight order
			const validators = response.data;

			for (let index = 0; index < validators.length - 1; index++) {
				const curValidator = validators[index];
				const nextValidator = validators[index + 1];
				expect(BigInt(curValidator.validatorWeight))
					.toBeGreaterThanOrEqual(BigInt(nextValidator.validatorWeight));

				if (curValidator.validatorWeight === nextValidator.validatorWeight) {
					// Should be sorted by address when validator weights are same
					if (curValidator.rank < nextValidator.rank) {
						expect(getAddressFromLisk32Address(curValidator.address)
							.compare(getAddressFromLisk32Address(nextValidator.address)))
							.toBe(-1);
					} else {
						expect(getAddressFromLisk32Address(curValidator.address)
							.compare(getAddressFromLisk32Address(nextValidator.address)))
							.toBe(1);
					}
				} else {
					expect(curValidator.rank).toBeLessThan(nextValidator.rank);
				}
			}
		});

		it('should return list of validators when requested with search param (partial validator name)', async () => {
			const searchParam = refGenerators.name ? refGenerators.name.substring(0, 3) : '';
			const response = await api.get(`${endpoint}?search=${searchParam}`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with search param (partial validator address)', async () => {
			const searchParam = refGenerators.address ? refGenerators.address.substring(0, 3) : '';
			const response = await api.get(`${endpoint}?search=${searchParam}`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with search param (partial validator public key)', async () => {
			const searchParam = refGenerators[0].publicKey ? refGenerators[0].publicKey.substring(0, 3) : '';
			const response = await api.get(`${endpoint}?search=${searchParam}`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with search param (partial validator name) and offset=1', async () => {
			const searchParam = refGenerators[0].name ? refGenerators[0].name.substring(0, 3) : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&offset=1`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with search param (partial validator address) and offset=1', async () => {
			const searchParam = refGenerators[0].address ? refGenerators[0].address.substring(0, 3) : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&offset=1`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with search param (partial validator public key) and offset=1', async () => {
			const searchParam = refGenerators[0].publicKey ? refGenerators[0].publicKey.substring(0, 3) : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&offset=1`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with search param (partial validator name) and limit=5', async () => {
			const searchParam = refGenerators[0].name ? refGenerators[0].name.substring(0, 3) : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested with search param (partial validator address) and limit=5', async () => {
			const searchParam = refGenerators[0].address ? refGenerators[0].address.substring(0, 3) : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested with search param (partial validator public key) and limit=5', async () => {
			const searchParam = refGenerators[0].publicKey ? refGenerators[0].publicKey.substring(0, 3) : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested with search param (partial validator name), offset=1 and limit=5', async () => {
			const searchParam = refGenerators[0].name ? refGenerators[0].name.substring(0, 3) : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&offset=1&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested with search param (partial validator address), offset=1 and limit=5', async () => {
			const searchParam = refGenerators[0].address ? refGenerators[0].address.substring(0, 3) : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&offset=1&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested with search param (partial validator public key), offset=1 and limit=5', async () => {
			const searchParam = refGenerators[0].publicKey ? refGenerators[0].publicKey.substring(0, 3) : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&offset=1&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested with known validator address', async () => {
			const response = await api.get(`${endpoint}?address=${refGenerators[0].address}`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBe(1);
		});

		it('should return list of validators when requested with known csv validator address', async () => {
			const addresses = refGenerators.map(generator => generator.address);
			const response = await api.get(`${endpoint}?address=${addresses}`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with csv validator address and offset=1', async () => {
			const addresses = refGenerators.map(generator => generator.address);
			const response = await api.get(`${endpoint}?address=${addresses}&offset=1`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with csv validator address and limit=5', async () => {
			const addresses = refGenerators.map(generator => generator.address);
			const response = await api.get(`${endpoint}?address=${addresses}&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested with csv validator address, offset=1 and limit=5', async () => {
			const addresses = refGenerators.map(generator => generator.address);
			const response = await api.get(`${endpoint}?address=${addresses}&offset=1&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested for known validator publicKey', async () => {
			const { publicKey = null } = refGenerators.find(generator => generator.publicKey);
			const response = await api.get(`${endpoint}?publicKey=${publicKey}`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBe(1);
		});

		it('should return list of validators when requested for known validator name', async () => {
			const response = await api.get(`${endpoint}?name=${refGenerators[0].name}`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBe(1);
		});

		it('should return list of validators when requested with known csv validator name', async () => {
			const names = refGenerators.map(generator => generator.name);
			const response = await api.get(`${endpoint}?name=${names}`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with csv validator name and offset=1', async () => {
			const names = refGenerators.map(generator => generator.name);
			const response = await api.get(`${endpoint}?name=${names}&offset=1`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with csv validator name and limit=5', async () => {
			const names = refGenerators.map(generator => generator.name);
			const response = await api.get(`${endpoint}?name=${names}&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested with csv validator name, offset=1 and limit=5', async () => {
			const names = refGenerators.map(generator => generator.name);
			const response = await api.get(`${endpoint}?name=${names}&offset=1&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('should return empty when requested for known non-validator address', async () => {
			const response = await api.get(`${endpoint}?address=lsk99999999999999999999999999999999999999`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBe(0);
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
