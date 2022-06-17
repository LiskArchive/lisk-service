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

describe('Generators API', () => {
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

		it('limit=0 -> -32602', async () => {
			const response = await getGenerators({ limit: 0 }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		});

		it('invalid request param -> invalid param', async () => {
			const response = await getGenerators({ invalidParam: 'invalid' });
			expect(response).toMap(invalidParamsSchema);
		});
	});
});
