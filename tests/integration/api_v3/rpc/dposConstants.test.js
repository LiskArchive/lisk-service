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
	dposConstantsSchema,
	dposConstantsMetaSchema,
} = require('../../../schemas/api_v3/dposConstants.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getDPoSConstants = async (params) => request(wsRpcUrl, 'get.dpos.constants', params);

describe('get.dpos.constants', () => {
	it('Returns constants from sdk dpos module when requested', async () => {
		const response = await getDPoSConstants();
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result.data).toMap(dposConstantsSchema);
		expect(result.data.minWeightStandby.length).toBeGreaterThanOrEqual(1);
		expect(result.data.tokenIDDPoS.length).toBeGreaterThanOrEqual(1);
		expect(result.meta).toMap(dposConstantsMetaSchema);
	});

	it('params not supported -> INVALID_PARAMS (-32602)', async () => {
		const response = await request(wsRpcUrl, 'get.fees', {
			someparam: 'not_supported',
		}).catch(e => e);
		expect(response).toMap(invalidParamsSchema);
	});
});
