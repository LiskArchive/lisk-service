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

const {
	posConstantsSchema,
	posConstantsMetaSchema,
} = require('../../../schemas/api_v3/posConstants.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getPosConstants = async (params) => request(wsRpcUrl, 'get.pos.constants', params);

describe('get.pos.constants', () => {
	it('returns PoS module constants', async () => {
		const response = await getPosConstants();
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result.data).toMap(posConstantsSchema);
		expect(result.meta).toMap(posConstantsMetaSchema);

		expect(result.data.roundLength)
			.toEqual(result.data.numberActiveValidators + result.data.numberStandbyValidators);
	});

	it('params not supported -> INVALID_PARAMS (-32602)', async () => {
		const response = await request(
			wsRpcUrl,
			'get.pos.constants',
			{ someparam: 'not_supported' },
		).catch(e => e);
		expect(response).toMap(invalidParamsSchema);
	});
});
