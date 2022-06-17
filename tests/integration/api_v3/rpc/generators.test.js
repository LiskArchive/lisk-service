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
		it('limit = 100 -> ok', async () => {
			const response = await getGenerators({ limit: 100 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			result.data.map(generator => expect(generator).toMap(generatorSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('limit = 0 -> -32602', async () => {
			const response = await getGenerators({ limit: 0 }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		});

		it('empty limit -> all generators', async () => {
			const response = await getGenerators({ limit: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			result.data.map(generator => expect(generator).toMap(generatorSchema));
			expect(result.meta).toMap(metaSchema);
		});
	});
});
