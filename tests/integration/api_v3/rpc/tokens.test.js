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
	tokensSchema,
	tokensMetaSchema,
} = require('../../../schemas/api_v3/tokensSchema.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getTokensInfo = async (params) => request(wsRpcUrl, 'get.tokens', params);

describe('get.tokens', () => {
	// TODO: Enable/update when token modules endpoints works
	xit('returns tokens info when call with address', async () => {
		const response = await getTokensInfo({ address: '' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(tokenInfo => expect(tokenInfo).toMap(tokensSchema));
		expect(response.meta).toMap(tokensMetaSchema);
	});

	// TODO: Enable/update when token modules endpoints works
	xit('returns tokens info when call with address and limit=10', async () => {
		const response = await getTokensInfo({ address: '', limit: 10 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(tokenInfo => expect(tokenInfo).toMap(tokensSchema));
		expect(response.meta).toMap(tokensMetaSchema);
	});

	// TODO: Enable/update when token modules endpoints works
	xit('returns tokens info when call with address, limit=10 and offset=1', async () => {
		const response = await getTokensInfo({ address: '', limit: 10, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(tokenInfo => expect(tokenInfo).toMap(tokensSchema));
		expect(response.meta).toMap(tokensMetaSchema);
	});

	// TODO: Enable/update when token modules endpoints works
	xit('returns token info when call with address and tokenID', async () => {
		const response = await getTokensInfo({ address: '', tokenID: '' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toEqual(1);
		result.data.forEach(tokenInfo => expect(tokenInfo).toMap(tokensSchema));
		expect(response.meta).toMap(tokensMetaSchema);
	});

	it('invalid request param -> invalid param', async () => {
		const response = await getTokensInfo({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('No address -> invalid param', async () => {
		const response = await getTokensInfo();
		expect(response).toMap(invalidParamsSchema);
	});

	it('No address with tokenID -> invalid param', async () => {
		const response = await getTokensInfo({ tokenID: '' });
		expect(response).toMap(invalidParamsSchema);
	});
});
