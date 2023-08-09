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
const { request } = require('../../../helpers/socketIoRpcRequest');

const { invalidParamsSchema, jsonRpcEnvelopeSchema } = require('../../../schemas/rpcGenerics.schema');
const { validatorsResponseSchema } = require('../../../schemas/api_v3/posValidators.schema');
const { invalidLimits, invalidOffsets, invalidPartialSearches, invalidNamesCSV, invalidAddresses, invalidPublicKeys } = require('../constants/invalidInputs');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getValidators = async params => request(wsRpcUrl, 'get.pos.validators', params);
const getGenerators = async params => request(wsRpcUrl, 'get.generators', params);
const getPosConstants = async params => request(wsRpcUrl, 'get.pos.constants', params);

describe('pos/validators API', () => {
	let numberActiveValidators;
	let numberStandbyValidators;
	let refGenerators;

	beforeAll(async () => {
		const { result } = await getPosConstants();
		numberActiveValidators = result.data.numberActiveValidators;
		numberStandbyValidators = result.data.numberStandbyValidators;

		const generatorsResponse = await getGenerators();
		refGenerators = generatorsResponse.result.data;
	});

	describe('get.pos.validators', () => {
		it('should return list of validators when requested', async () => {
			const response = await getValidators({
				limit: numberActiveValidators + numberStandbyValidators,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length)
				.toBeLessThanOrEqual(numberActiveValidators + numberStandbyValidators);
		});

		it('should return list of correctly sorted validators when called with sort=validatorWeight:desc', async () => {
			const response = await getValidators({
				sort: 'validatorWeight:desc',
			});
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);

			// Sort validators by rank to check validate weight order
			const validators = result.data;

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
			const searchParam = refGenerators[0].name ? refGenerators[0].name.substring(0, 3) : '';
			const response = await getValidators({ search: searchParam });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with search param (partial validator address)', async () => {
			const searchParam = refGenerators[0].address ? refGenerators[0].address.substring(0, 3) : '';
			const response = await getValidators({ search: searchParam });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with search param (partial validator public key)', async () => {
			const searchParam = refGenerators[0].publicKey ? refGenerators[0].publicKey.substring(0, 3) : '';
			const response = await getValidators({ search: searchParam });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with search param (partial validator name) and offset=1', async () => {
			const searchParam = refGenerators[0].name ? refGenerators[0].name.substring(0, 3) : '';
			const response = await getValidators({ search: searchParam, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with search param (partial validator address) and offset=1', async () => {
			const searchParam = refGenerators[0].address ? refGenerators[0].address.substring(0, 5) : '';
			const response = await getValidators({ search: searchParam, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with search param (partial validator public key) and offset=1', async () => {
			const searchParam = refGenerators[0].publicKey ? refGenerators[0].publicKey.substring(0, 3) : '';
			const response = await getValidators({ search: searchParam, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with search param (partial validator name) and limit=5', async () => {
			const searchParam = refGenerators[0].name ? refGenerators[0].name.substring(0, 3) : '';
			const response = await getValidators({ search: searchParam, limit: 5 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested with search param (partial validator address) and limit=5', async () => {
			const searchParam = refGenerators[0].address ? refGenerators[0].address.substring(0, 3) : '';
			const response = await getValidators({ search: searchParam, limit: 5 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested with search param (partial validator public key) and limit=5', async () => {
			const searchParam = refGenerators[0].publicKey ? refGenerators[0].publicKey.substring(0, 3) : '';
			const response = await getValidators({ search: searchParam, limit: 5 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested with search param (partial validator name), offset=1 and limit=5', async () => {
			const searchParam = refGenerators[0].name ? refGenerators[0].name.substring(0, 3) : '';
			const response = await getValidators({
				search: searchParam,
				offset: 1,
				limit: 5,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested with search param (partial validator address), offset=1 and limit=5', async () => {
			const searchParam = refGenerators[0].address ? refGenerators[0].address.substring(0, 3) : '';
			const response = await getValidators({
				search: searchParam,
				offset: 1,
				limit: 5,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested with search param (partial validator public key), offset=1 and limit=5', async () => {
			const searchParam = refGenerators[0].publicKey ? refGenerators[0].publicKey.substring(0, 3) : '';
			const response = await getValidators({
				search: searchParam,
				offset: 1,
				limit: 5,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested with known validator address', async () => {
			const response = await getValidators({ address: refGenerators[0].address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBe(1);
		});

		it('should return list of validators when requested with known csv validator address', async () => {
			const addresses = refGenerators.map(generator => generator.address).join(',');
			const response = await getValidators({ address: addresses });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with csv validator address and offset=1', async () => {
			const addresses = refGenerators.map(generator => generator.address).join(',');
			const response = await getValidators({ address: addresses, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with csv validator address and limit=5', async () => {
			const addresses = refGenerators.map(generator => generator.address).join(',');
			const response = await getValidators({ address: addresses, limit: 5 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested with csv validator address, offset=1 and limit=5', async () => {
			const addresses = refGenerators.map(generator => generator.address).join(',');
			const response = await getValidators({ address: addresses, offset: 1, limit: 5 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested for known validator publicKey', async () => {
			const { publicKey = null } = refGenerators.find(generator => generator.publicKey);
			const response = await getValidators({ publicKey });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBe(1);
		});

		it('should return list of validators when requested for known validator name', async () => {
			const response = await getValidators({ name: refGenerators[0].name });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBe(1);
		});

		it('should return list of validators when requested with known csv validator name', async () => {
			const names = refGenerators.map(generator => generator.name).join(',');
			const response = await getValidators({ name: names });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with csv validator name and offset=1', async () => {
			const names = refGenerators.map(generator => generator.name).join(',');
			const response = await getValidators({ name: names, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('should return list of validators when requested with csv validator name and limit=5', async () => {
			const names = refGenerators.map(generator => generator.name).join(',');
			const response = await getValidators({ name: names, limit: 5 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
		});

		it('should return list of validators when requested with csv validator name, offset=1 and limit=5', async () => {
			const names = refGenerators.map(generator => generator.name).join(',');
			const response = await getValidators({ name: names, offset: 1, limit: 5 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(5);
		});

		it('should return empty when requested for known non-validator address', async () => {
			const response = await getValidators({ address: 'lsk99999999999999999999999999999999999999' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBe(0);
		});

		it('should return invalid params for invalid address', async () => {
			for (let i = 0; i < invalidAddresses.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await getValidators({ address: invalidAddresses[i] });
				expect(response).toMap(invalidParamsSchema);
			}
		});

		it('should return invalid params for invalid publicKey', async () => {
			for (let i = 0; i < invalidPublicKeys.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await getValidators({ publicKey: invalidPublicKeys[i] });
				expect(response).toMap(invalidParamsSchema);
			}
		});

		it('should return invalid params for invalid name', async () => {
			for (let i = 0; i < invalidNamesCSV.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await getValidators({ name: invalidNamesCSV[i] });
				expect(response).toMap(invalidParamsSchema);
			}
		});

		it('should return invalid params for invalid search', async () => {
			for (let i = 0; i < invalidPartialSearches.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await getValidators({ search: invalidPartialSearches[i] });
				expect(response).toMap(invalidParamsSchema);
			}
		});

		it('should return invalid params for invalid limit', async () => {
			for (let i = 0; i < invalidLimits.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await getValidators({ limit: invalidLimits[i] });
				expect(response).toMap(invalidParamsSchema);
			}
		});

		it('should return invalid params for invalid search', async () => {
			for (let i = 0; i < invalidOffsets.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await getValidators({ offset: invalidOffsets[i] });
				expect(response).toMap(invalidParamsSchema);
			}
		});

		it('should return invalid params if requested with invalid status', async () => {
			const response = await getValidators({ status: '__%' });
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return invalid params if requested with invalid sort', async () => {
			const response = await getValidators({ sort: 'comm:asc' });
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return invalid params for invalid param', async () => {
			const response = await getValidators({ invalidParam: 'invalid' });
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return invalid params for empty param', async () => {
			const response = await getValidators({ invalidParam: '' });
			expect(response).toMap(invalidParamsSchema);
		});
	});
});
