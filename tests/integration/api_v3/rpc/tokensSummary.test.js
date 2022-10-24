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
	tokensSummaryResponseSchema,
	goodResponseSchema,
	tokensSummaryMetaResponseSchema,
} = require('../../../schemas/api_v3/tokensSummary.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getTokensSummaryInfo = async (params) => request(wsRpcUrl, 'get.tokens.summary', params);

describe('get.tokens.summary', () => {
	it('Returns tokens info when call with address', async () => {
		const response = await getTokensSummaryInfo({});
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(tokensSummaryResponseSchema);
		expect(result.meta).toMap(tokensSummaryMetaResponseSchema);
	});

	it('Invalid request param -> invalid param', async () => {
		const response = await getTokensSummaryInfo({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
