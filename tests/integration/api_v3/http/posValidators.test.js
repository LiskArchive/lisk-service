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
		it('Returns list of validators when requested', async () => {
			const response = await api.get(`${endpoint}?limit=${numberActiveValidators + numberStandbyValidators}`);
			const activeDelegateCount = response.data.filter(validator => validator.status === 'active').length;
			expect(response).toMap(validatorsResponseSchema);
			expect(activeDelegateCount).toBe(numberActiveValidators);
			expect(response.data.length - activeDelegateCount).toBe(numberStandbyValidators);
		});

		it('Returns list of validators when requested with search param (partial validator name)', async () => {
			const searchParam = refGenerators.name ? refGenerators.name[0] : '';
			const response = await api.get(`${endpoint}?search=${searchParam}`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with search param (partial validator address)', async () => {
			const searchParam = refGenerators.address ? refGenerators.address[0] : '';
			const response = await api.get(`${endpoint}?search=${searchParam}`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with search param (partial validator public key)', async () => {
			const searchParam = refGenerators[0].publicKey ? refGenerators[0].publicKey[0] : '';
			const response = await api.get(`${endpoint}?search=${searchParam}`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with search param (partial validator name) and offset=1', async () => {
			const searchParam = refGenerators[0].name ? refGenerators[0].name[0] : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&offset=1`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with search param (partial validator address) and offset=1', async () => {
			const searchParam = refGenerators[0].address ? refGenerators[0].address[0] : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&offset=1`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with search param (partial validator public key) and offset=1', async () => {
			const searchParam = refGenerators[0].publicKey ? refGenerators[0].publicKey[0] : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&offset=1`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with search param (partial validator name) and limit=5', async () => {
			const searchParam = refGenerators[0].name ? refGenerators[0].name[0] : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of validators when requested with search param (partial validator address) and limit=5', async () => {
			const searchParam = refGenerators[0].address ? refGenerators[0].address[0] : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of validators when requested with search param (partial validator public key) and limit=5', async () => {
			const searchParam = refGenerators[0].publicKey ? refGenerators[0].publicKey[0] : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of validators when requested with search param (partial validator name), offset=1 and limit=5', async () => {
			const searchParam = refGenerators[0].name ? refGenerators[0].name[0] : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&offset=1&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of validators when requested with search param (partial validator address), offset=1 and limit=5', async () => {
			const searchParam = refGenerators[0].address ? refGenerators[0].address[0] : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&offset=1&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of validators when requested with search param (partial validator public key), offset=1 and limit=5', async () => {
			const searchParam = refGenerators[0].publicKey ? refGenerators[0].publicKey[0] : '';
			const response = await api.get(`${endpoint}?search=${searchParam}&offset=1&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of validators when requested with known validator address', async () => {
			const response = await api.get(`${endpoint}?address=${refGenerators[0].address}`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBe(1);
		});

		it('Returns list of validators when requested with known csv validator address', async () => {
			const addresses = refGenerators.map(generator => generator.address);
			const response = await api.get(`${endpoint}?address=${addresses}`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with csv validator address and offset=1', async () => {
			const addresses = refGenerators.map(generator => generator.address);
			const response = await api.get(`${endpoint}?address=${addresses}&offset=1`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with csv validator address and limit=5', async () => {
			const addresses = refGenerators.map(generator => generator.address);
			const response = await api.get(`${endpoint}?address=${addresses}&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of validators when requested with csv validator address, offset=1 and limit=5', async () => {
			const addresses = refGenerators.map(generator => generator.address);
			const response = await api.get(`${endpoint}?address=${addresses}&offset=1&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of validators when requested for known validator publicKey', async () => {
			const { publicKey = null } = refGenerators.find(generator => generator.publicKey);
			const response = await api.get(`${endpoint}?publicKey=${publicKey}`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBe(1);
		});

		it('Returns list of validators when requested for known validator name', async () => {
			const response = await api.get(`${endpoint}?name=${refGenerators[0].name}`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBe(1);
		});

		it('Returns list of validators when requested with known csv validator name', async () => {
			const names = refGenerators.map(generator => generator.name);
			const response = await api.get(`${endpoint}?name=${names}`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with csv validator name and offset=1', async () => {
			const names = refGenerators.map(generator => generator.name);
			const response = await api.get(`${endpoint}?name=${names}&offset=1`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with csv validator name and limit=5', async () => {
			const names = refGenerators.map(generator => generator.name);
			const response = await api.get(`${endpoint}?name=${names}&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of validators when requested with csv validator name, offset=1 and limit=5', async () => {
			const names = refGenerators.map(generator => generator.name);
			const response = await api.get(`${endpoint}?name=${names}&offset=1&limit=5`);
			expect(response).toMap(validatorsResponseSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
		});

		it('Returns empty when requested for known non-validator address', async () => {
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
