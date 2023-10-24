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
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	jsonRpcEnvelopeSchema,
	invalidParamsSchema,
} = require('../../../schemas/rpcGenerics.schema');

const { generatorResponseSchema } = require('../../../schemas/api_v3/generator.schema');
const {
	invalidPartialSearches,
	invalidOffsets,
	invalidLimits,
} = require('../constants/invalidInputs');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getGenerators = async params => request(wsRpcUrl, 'get.generators', params);
const getPoSConstants = async () => request(wsRpcUrl, 'get.pos.constants');

const STATUS = {
	ACTIVE: 'active',
	STANDBY: 'standby',
};

describe('Generators API', () => {
	let numberActiveValidators;
	let numberStandbyValidators;
	let selectedGenerator;

	beforeAll(async () => {
		const response = await getPoSConstants();
		const constants = response.result.data;
		numberActiveValidators = constants.numberActiveValidators;
		numberStandbyValidators = constants.numberStandbyValidators;

		const { result } = await getGenerators();
		[selectedGenerator] = result.data;

		// eslint-disable-next-line no-restricted-syntax
		for (const generator of result.data) {
			if (![null, undefined].includes(generator.publicKey)) {
				selectedGenerator = generator;
				break;
			}
		}
	});

	describe('GET /generators', () => {
		it('should return generators list', async () => {
			const response = await getGenerators();
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(generatorResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(103);
		});

		it('should return generators list when called with limit 103', async () => {
			const response = await getGenerators({ limit: 103 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(generatorResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(103);

			const activeGenerators = result.data.filter(generator => generator.status === STATUS.ACTIVE);
			const standbyGenerators = result.data.filter(
				generator => generator.status === STATUS.STANDBY,
			);
			expect(activeGenerators.length).toBeGreaterThanOrEqual(1);
			expect(activeGenerators.length).toBeLessThanOrEqual(numberActiveValidators);
			expect(standbyGenerators.length).toBeGreaterThanOrEqual(0);
			expect(standbyGenerators.length).toBeLessThanOrEqual(numberStandbyValidators);
		});

		it('should return generators list when called with limit=100', async () => {
			const response = await getGenerators({ limit: 100 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(generatorResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(100);
		});

		it('should return generators list when called with limit=100 and offset=1', async () => {
			const response = await getGenerators({ limit: 100, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(generatorResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(100);
		});

		it('should return generators list when called with empty limit', async () => {
			const response = await getGenerators({ limit: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(generatorResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(103);
		});

		it('should return generators list when searching with generator name', async () => {
			const response = await getGenerators({ search: selectedGenerator.name });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(generatorResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
		});

		it('should return generators list when searching with generator address', async () => {
			const response = await getGenerators({ search: selectedGenerator.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(generatorResponseSchema);
			expect(result.data.length).toBe(1);
		});

		it('should return generators list when searching with generator publicKey', async () => {
			if (selectedGenerator.publicKey) {
				const response = await getGenerators({ search: selectedGenerator.publicKey });
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result).toMap(generatorResponseSchema);
				expect(result.data.length).toBe(1);
			}
		});

		it('should return generators list when searching partially with generator name', async () => {
			const response = await getGenerators({ search: selectedGenerator.name.substring(0, 3) });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(generatorResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(103);
		});

		it('should return generators list when searching partially with generator address', async () => {
			const response = await getGenerators({ search: selectedGenerator.address.substring(0, 3) });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(generatorResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(103);
		});

		it('should return generators list when searching partially with generator publicKey', async () => {
			if (selectedGenerator.publicKey) {
				const response = await getGenerators({
					search: selectedGenerator.publicKey.substring(0, 3),
				});
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result).toMap(generatorResponseSchema);
				expect(result.data.length).toBeGreaterThanOrEqual(1);
				expect(result.data.length).toBeLessThanOrEqual(103);
			}
		});

		it('should return invalid params when called with invalid search param', async () => {
			for (let i = 0; i < invalidPartialSearches.length; i++) {
				const response = await getGenerators({ search: invalidPartialSearches[i] }).catch(e => e);
				expect(response).toMap(invalidParamsSchema);
			}
		});

		it('should return invalid params when called with invalid limit param', async () => {
			for (let i = 0; i < invalidLimits.length; i++) {
				const response = await getGenerators({ limit: invalidLimits[i] }).catch(e => e);
				expect(response).toMap(invalidParamsSchema);
			}
		});

		it('should return invalid params when called with invalid offset param', async () => {
			for (let i = 0; i < invalidOffsets.length; i++) {
				const response = await getGenerators({ offset: invalidOffsets[i] }).catch(e => e);
				expect(response).toMap(invalidParamsSchema);
			}
		});

		it('should return invalid params when called with invalid request param', async () => {
			const response = await getGenerators({ invalidParam: 'invalid' });
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return invalid params when called with empty invalid request param', async () => {
			const response = await getGenerators({ invalidParam: '' });
			expect(response).toMap(invalidParamsSchema);
		});
	});
});
