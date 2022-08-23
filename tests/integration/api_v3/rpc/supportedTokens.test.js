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
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	supportedTokensSchema,
} = require('../../../schemas/api_v3/tokens.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getSupportedTokens = async (params) => request(wsRpcUrl, 'get.tokens.supported', params);

describe('get.tokens.supported', () => {
	it('returns list of supported tokens', async () => {
		const response = await getSupportedTokens();
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data.supportedTokens).toBeInstanceOf(Array);
		expect(result.data.supportedTokens.length).toBeLessThanOrEqual(10);
		expect(result.data).toMap(supportedTokensSchema);
		expect(result.meta).toMap(metaSchema);
	});

	it('returns list of supported tokens with limit=5', async () => {
		const response = await getSupportedTokens({ limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data.supportedTokens).toBeInstanceOf(Array);
		expect(result.data.supportedTokens.length).toBeLessThanOrEqual(5);
		expect(result.data).toMap(supportedTokensSchema);
		expect(result.meta).toMap(metaSchema);
	});

	it('returns list of supported tokens with limit=5 and offset=1', async () => {
		const response = await getSupportedTokens({ limit: 5, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data.supportedTokens).toBeInstanceOf(Array);
		expect(result.data.supportedTokens.length).toBeLessThanOrEqual(5);
		expect(result.data).toMap(supportedTokensSchema);
		expect(result.meta).toMap(metaSchema);
	});

	it('invalid request param -> invalid param', async () => {
		const response = await getSupportedTokens({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
