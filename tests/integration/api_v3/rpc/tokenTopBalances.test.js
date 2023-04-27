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

const {
	request,
} = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	goodResponseSchemaForTokenTopBalances,
} = require('../../../schemas/api_v3/tokenTopBalances.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getTokensTopBalances = async (params) => request(wsRpcUrl, 'get.token.balances.top', params);
const tokenID = "0400000000000000";


describe('get.token.ids', () => {
	it('returns token top balances when requested with token ID', async () => {
		const response = await getTokensTopBalances({ tokenID: tokenID });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenTopBalances);
		expect(result.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('Returns token top balances when requested with token ID and offset=1', async () => {
        const response = await getTokensTopBalances({ tokenID: tokenID, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenTopBalances);
		expect(result.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('returns token top balances when requested with token ID and limit=5', async () => {
        const response = await getTokensTopBalances({ tokenID: tokenID, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenTopBalances);
		expect(result.data[tokenID].length).toBeLessThanOrEqual(5);
	});

	it('returns token top balances when requested with token ID, offset=1 and limit=5', async () => {
        const response = await getTokensTopBalances({ tokenID: tokenID, offset: 1, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenTopBalances);
		expect(result.data[tokenID].length).toBeLessThanOrEqual(5);
	});

    it('No tokenID -> bad request', async () => {
        const response = await getTokensTopBalances({});
		expect(response).toMap(invalidParamsSchema);
    });

	it('Invalid request param -> invalid param', async () => {
		const response = await getTokensTopBalances({ tokenID: tokenID, invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid limit -> invalid param', async () => {
		const response = await getTokensTopBalances({ tokenID: tokenID, limit: 'L' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid offset -> invalid param', async () => {
		const response = await getTokensTopBalances({ tokenID: tokenID, offset: 'L' });
		expect(response).toMap(invalidParamsSchema);
	});
});