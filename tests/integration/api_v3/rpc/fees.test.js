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
	feeEstimateSchema,
	goodRequestSchema,
	metaSchema,
} = require('../../../schemas/api_v3/fees.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const requestFeeEstimate = async () => request(wsRpcUrl, 'get.fees');

// TODO: Enable test once response structure is refactored for minFeePerByte
xdescribe('get.fees', () => {
	it('returns estimated fees, when supported', async () => {
		const response = await requestFeeEstimate();
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data).toMap(feeEstimateSchema);
		expect(result.meta).toMap(metaSchema);
	});

	it('params not supported -> INVALID_PARAMS (-32602)', async () => {
		const response = await request(wsRpcUrl, 'get.fees', {
			someparam: 'not_supported',
		}).catch(e => e);
		expect(response).toMap(invalidParamsSchema);
	});
});
