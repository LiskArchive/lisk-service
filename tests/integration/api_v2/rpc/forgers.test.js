/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
	forgerSchema,
} = require('../../../schemas/api_v2/forger.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const getForgers = async params => request(wsRpcUrl, 'get.forgers', params);

describe('Forgers API', () => {
	describe('GET /forgers', () => {
		it('limit = 100 -> ok', async () => {
			const response = await getForgers({ limit: 100 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			result.data.map(forger => expect(forger).toMap(forgerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('limit = 0 -> -32602', async () => {
			const response = await getForgers({ limit: 0 }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		});

		it('empty limit -> all forgers', async () => {
			const response = await getForgers({ limit: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			result.data.map(forger => expect(forger).toMap(forgerSchema));
			expect(result.meta).toMap(metaSchema);
		});
	});
});
