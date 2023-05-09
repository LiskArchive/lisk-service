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
	resultEnvelopeSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
	invalidParamsSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	generatorSchema,
} = require('../../../schemas/api_v3/generatorSchema.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getGenerators = async params => request(wsRpcUrl, 'get.generators', params);
// const getPoSConstants = async () => request(wsRpcUrl, 'get.pos.constants');

// const STATUS = {
// 	ACTIVE: 'active',
// 	STANDBY: 'standby',
// };

describe('Generators API', () => {
	// let numberActiveValidators;
	// let numberStandbyValidators;
	// beforeAll(async () => {
	// 	const response = await getPoSConstants();
	// 	const constants = response.result.data;
	// 	numberActiveValidators = constants.numberActiveValidators;
	// 	numberStandbyValidators = constants.numberStandbyValidators;
	// });

	let firstGenerator;
	beforeAll(async () => {
		const { result } = await getGenerators();
		[firstGenerator] = result.data;
	});

	describe('GET /generators', () => {
		it('returns generators list -> ok', async () => {
			const response = await getGenerators();
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(103);
			result.data.map(generator => expect(generator).toMap(generatorSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('returns generators list with limit=103 -> ok', async () => {
			const response = await getGenerators({ limit: 103 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(103);
			result.data.map(generator => expect(generator).toMap(generatorSchema));

			// const activeGenerators = result.data
			// 	.filter(generator => generator.status === STATUS.ACTIVE);
			// const standbyGenerators = result.data
			// 	.filter(generator => generator.status === STATUS.STANDBY);
			// expect(activeGenerators.length).toEqual(numberActiveValidators);
			// expect(standbyGenerators.length).toEqual(numberStandbyValidators);

			expect(result.meta).toMap(metaSchema);
		});

		it('returns generators list with limit=100 -> ok', async () => {
			const response = await getGenerators({ limit: 100 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(100);
			result.data.map(generator => expect(generator).toMap(generatorSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('returns generators list with limit=100 and offset=1 -> ok', async () => {
			const response = await getGenerators({ limit: 100, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(100);
			result.data.map(generator => expect(generator).toMap(generatorSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty limit -> all generators', async () => {
			const response = await getGenerators({ limit: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(103);
			result.data.map(generator => expect(generator).toMap(generatorSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('retrieve generators list by searching with name -> ok', async () => {
			const response = await getGenerators({ search: firstGenerator.name });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBe(1);
			result.data.map(generator => expect(generator).toMap(generatorSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('retrieve generators list by searching with address -> ok', async () => {
			const response = await getGenerators({ search: firstGenerator.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBe(1);
			result.data.map(generator => expect(generator).toMap(generatorSchema));
			expect(result.meta).toMap(metaSchema);
		});

		xit('retrieve generators list by searching with public key -> ok', async () => {
			const response = await getGenerators({ search: firstGenerator.publicKey });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBe(1);
			result.data.map(generator => expect(generator).toMap(generatorSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('retrieve generators list by searching partially with name -> ok', async () => {
			const response = await getGenerators({ search: firstGenerator.name.substring(0, 3) });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(103);
			result.data.map(generator => expect(generator).toMap(generatorSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('retrieve generators list by searching partially with address -> ok', async () => {
			const response = await getGenerators({ search: firstGenerator.address.substring(0, 3) });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(103);
			result.data.map(generator => expect(generator).toMap(generatorSchema));
			expect(result.meta).toMap(metaSchema);
		});

		xit('retrieve generators list by searching partially with public key -> ok', async () => {
			const response = await getGenerators({ search: firstGenerator.publicKey.substring(0, 3) });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(103);
			result.data.map(generator => expect(generator).toMap(generatorSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('search=(*) -> invalid param', async () => {
			const response = await getGenerators({ limit: '(*)' }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		});

		it('limit=0 -> invalid param', async () => {
			const response = await getGenerators({ limit: 0 }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		});

		it('invalid request param -> invalid param', async () => {
			const response = await getGenerators({ invalidParam: 'invalid' });
			expect(response).toMap(invalidParamsSchema);
		});
	});
});
