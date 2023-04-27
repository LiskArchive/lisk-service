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
const { request } = require('../../../helpers/socketIoRpcRequest');

const { invalidParamsSchema, jsonRpcEnvelopeSchema } = require('../../../schemas/rpcGenerics.schema');
const { validatorsResponseSchema } = require('../../../schemas/api_v3/posValidators.schema');

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
		it('Returns list of validators when requested', async () => {
			const response = await getValidators({
				limit: numberActiveValidators + numberStandbyValidators,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			const activeDelegateCount = result.data.filter(validator => validator.status === 'active').length;
			expect(result).toMap(validatorsResponseSchema);
			expect(activeDelegateCount).toBe(numberActiveValidators);
			expect(result.data.length - activeDelegateCount).toBe(numberStandbyValidators);
		});

		it('Returns list of validators when requested with search param (partial validator name)', async () => {
			const searchParam = refGenerators[0].name ? refGenerators[0].name[0] : '';
			const response = await getValidators({ search: searchParam });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with search param (partial validator address)', async () => {
			const searchParam = refGenerators[0].address ? refGenerators[0].address[0] : '';
			const response = await getValidators({ search: searchParam });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with search param (partial validator public key)', async () => {
			const searchParam = refGenerators[0].publicKey ? refGenerators[0].publicKey[0] : '';
			const response = await getValidators({ search: searchParam });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with search param (partial validator name) and offset=1', async () => {
			const searchParam = refGenerators[0].name ? refGenerators[0].name[0] : '';
			const response = await getValidators({ search: searchParam, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with search param (partial validator address) and offset=1', async () => {
			const searchParam = refGenerators[0].address ? refGenerators[0].address[0] : '';
			const response = await getValidators({ search: searchParam, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with search param (partial validator public key) and offset=1', async () => {
			const searchParam = refGenerators[0].publicKey ? refGenerators[0].publicKey[0] : '';
			const response = await getValidators({ search: searchParam, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with search param (partial validator name) and limit=5', async () => {
			const searchParam = refGenerators[0].name ? refGenerators[0].name[0] : '';
			const response = await getValidators({ search: searchParam, limit: 5 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of validators when requested with search param (partial validator address) and limit=5', async () => {
			const searchParam = refGenerators[0].address ? refGenerators[0].address[0] : '';
			const response = await getValidators({ search: searchParam, limit: 5 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of validators when requested with search param (partial validator public key) and limit=5', async () => {
			const searchParam = refGenerators[0].publicKey ? refGenerators[0].publicKey[0] : '';
			const response = await getValidators({ search: searchParam, limit: 5 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of validators when requested with search param (partial validator name), offset=1 and limit=5', async () => {
			const searchParam = refGenerators[0].name ? refGenerators[0].name[0] : '';
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

		it('Returns list of validators when requested with search param (partial validator address), offset=1 and limit=5', async () => {
			const searchParam = refGenerators[0].address ? refGenerators[0].address[0] : '';
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

		it('Returns list of validators when requested with search param (partial validator public key), offset=1 and limit=5', async () => {
			const searchParam = refGenerators[0].publicKey ? refGenerators[0].publicKey[0] : '';
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

		it('Returns list of validators when requested with known validator address', async () => {
			const response = await getValidators({ address: refGenerators[0].address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBe(1);
		});

		it('Returns list of validators when requested with known csv validator address', async () => {
			const addresses = refGenerators.map(generator => generator.address).join(',');
			const response = await getValidators({ address: addresses });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with csv validator address and offset=1', async () => {
			const addresses = refGenerators.map(generator => generator.address).join(',');
			const response = await getValidators({ address: addresses, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with csv validator address and limit=5', async () => {
			const addresses = refGenerators.map(generator => generator.address).join(',');
			const response = await getValidators({ address: addresses, limit: 5 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of validators when requested with csv validator address, offset=1 and limit=5', async () => {
			const addresses = refGenerators.map(generator => generator.address).join(',');
			const response = await getValidators({ address: addresses, offset: 1, limit: 5 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of validators when requested for known validator publicKey', async () => {
			const { publicKey = null } = refGenerators.find(generator => generator.publicKey);
			const response = await getValidators({ publicKey });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBe(1);
		});

		it('Returns list of validators when requested for known validator name', async () => {
			const response = await getValidators({ name: refGenerators[0].name });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBe(1);
		});

		it('Returns list of validators when requested with known csv validator name', async () => {
			const names = refGenerators.map(generator => generator.name).join(',');
			const response = await getValidators({ name: names });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with csv validator name and offset=1', async () => {
			const names = refGenerators.map(generator => generator.name).join(',');
			const response = await getValidators({ name: names, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
		});

		it('Returns list of validators when requested with csv validator name and limit=5', async () => {
			const names = refGenerators.map(generator => generator.name).join(',');
			const response = await getValidators({ name: names, limit: 5 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
		});

		it('Returns list of validators when requested with csv validator name, offset=1 and limit=5', async () => {
			const names = refGenerators.map(generator => generator.name).join(',');
			const response = await getValidators({ name: names, offset: 1, limit: 5 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
		});

		it('Returns empty when requested for known non-validator address', async () => {
			const response = await getValidators({ address: 'lsk99999999999999999999999999999999999999' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(validatorsResponseSchema);
			expect(result.data.length).toBe(0);
		});

		it('Invalid address -> invalid param', async () => {
			const response = await getValidators({ address: 'address=L' });
			expect(response).toMap(invalidParamsSchema);
		});

		it('Invalid request param -> invalid param', async () => {
			const response = await getValidators({ invalidParam: 'invalid' });
			expect(response).toMap(invalidParamsSchema);
		});
	});
});
