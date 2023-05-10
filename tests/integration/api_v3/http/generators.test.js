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

const {
	badRequestSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	generatorResponseSchema,
} = require('../../../schemas/api_v3/generator.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const endpoint = `${baseUrl}/api/v3`;

// const STATUS = {
// 	ACTIVE: 'active',
// 	STANDBY: 'standby',
// };

describe('Generators API', () => {
	// let numberActiveValidators;
	// let numberStandbyValidators;
	// beforeAll(async () => {
	// 	const response = (await api.get(`${endpoint}/pos/constants`)).data;
	// 	numberActiveValidators = response.numberActiveValidators;
	// 	numberStandbyValidators = response.numberStandbyValidators;
	// });

	let firstGenerator;
	beforeAll(async () => {
		const response = await api.get(`${endpoint}/generators`);
		[firstGenerator] = response.data;
	});

	describe('GET /generators', () => {
		it('should return generators list', async () => {
			const response = await api.get(`${endpoint}/generators`);
			expect(response).toMap(generatorResponseSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(103);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return generators list when called with limit 103', async () => {
			const response = await api.get(`${endpoint}/generators?limit=103`);
			expect(response).toMap(generatorResponseSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(103);

			// TODO: Verify and fix
			// const activeGenerators = response.data
			// 	.filter(generator => generator.status === STATUS.ACTIVE);
			// const standbyGenerators = response.data
			// 	.filter(generator => generator.status === STATUS.STANDBY);
			// expect(activeGenerators.length).toEqual(numberActiveValidators);
			// expect(standbyGenerators.length).toEqual(numberStandbyValidators);

			expect(response.meta).toMap(metaSchema);
		});

		it('should return generators list when called with limit=100', async () => {
			const response = await api.get(`${endpoint}/generators?limit=100`);
			expect(response).toMap(generatorResponseSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return generators list when called with limit=100 and offset=1', async () => {
			const response = await api.get(`${endpoint}/generators?limit=100&offset=1`);
			expect(response).toMap(generatorResponseSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return generators list when searching with generator name', async () => {
			const response = await api.get(`${endpoint}/generators?search=${firstGenerator.name}`);
			expect(response).toMap(generatorResponseSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(1);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return generators list when searching with generator address', async () => {
			const response = await api.get(`${endpoint}/generators?search=${firstGenerator.address}`);
			expect(response).toMap(generatorResponseSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(1);
			expect(response.meta).toMap(metaSchema);
		});

		xit('should return generators list when searching with generator publicKey', async () => {
			const response = await api.get(`${endpoint}/generators?search=${firstGenerator.publicKey}`);
			expect(response).toMap(generatorResponseSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(1);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return generators list when searching partially with generator name', async () => {
			const response = await api.get(`${endpoint}/generators?search=${firstGenerator.name.substring(0, 3)}`);
			expect(response).toMap(generatorResponseSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return generators list when searching partially with generator address', async () => {
			const response = await api.get(`${endpoint}/generators?search=${firstGenerator.address.substring(0, 3)}`);
			expect(response).toMap(generatorResponseSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			expect(response.meta).toMap(metaSchema);
		});

		xit('should return generators list when searching partially with generator publicKey', async () => {
			const response = await api.get(`${endpoint}/generators?search=${firstGenerator.publicKey.substring(0, 3)}`);
			expect(response).toMap(generatorResponseSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return bad request when called with invalid search param', async () => {
			const response = await api.get(`${endpoint}/generators?search=(*)`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should return bad request when called with limit=0', async () => {
			const response = await api.get(`${endpoint}/generators?limit=0`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should return generators list when called with empty limit', async () => {
			const response = await api.get(`${endpoint}/generators?limit=`);
			expect(response).toMap(generatorResponseSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(103);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return bad request when called with invalid request param', async () => {
			const response = await api.get(`${endpoint}/generators?invalidParam=invalid`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});
});
