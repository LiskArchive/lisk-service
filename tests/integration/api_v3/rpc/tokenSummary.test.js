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

const {
	request,
} = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	tokenSummaryResponseSchema,
	goodResponseSchema,
	tokenSummaryMetaResponseSchema,
} = require('../../../schemas/api_v3/tokenSummary.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const gettokenSummaryInfo = async (params) => request(wsRpcUrl, 'get.token.summary', params);

describe('get.token.summary', () => {
	it('Retrieves tokens summary', async () => {
		const response = await gettokenSummaryInfo({});
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(tokenSummaryResponseSchema);
		expect(result.meta).toMap(tokenSummaryMetaResponseSchema);
	});

	it('Invalid request param -> invalid param', async () => {
		const response = await gettokenSummaryInfo({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
