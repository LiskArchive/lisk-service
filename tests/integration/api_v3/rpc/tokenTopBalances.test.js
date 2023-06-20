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
const getTokensIDs = async (params) => request(wsRpcUrl, 'get.token.available-ids', params);

describe('get.token.balances.top', () => {
	let tokenID;
	let tokenInfo;

	beforeAll(async () => {
		const { result } = await getTokensIDs({});
		[tokenID] = result.data.tokenIDs;

		const { result: { data: tokenInformation } } = await getTokensTopBalances({ tokenID });
		[tokenInfo] = tokenInformation[tokenID];
	});

	it('should retrieve top token balances when called with token ID', async () => {
		const response = await getTokensTopBalances({ tokenID });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenTopBalances);
		expect(result.data[tokenID].length).toBeGreaterThanOrEqual(1);
		expect(result.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('should retrieve top token balances when called with token ID and offset=1', async () => {
		const response = await getTokensTopBalances({ tokenID, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenTopBalances);
		expect(result.data[tokenID].length).toBeGreaterThanOrEqual(0);
		expect(result.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('returns top token balances when requested with token ID and limit=5', async () => {
		const response = await getTokensTopBalances({ tokenID, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenTopBalances);
		expect(result.data[tokenID].length).toBeGreaterThanOrEqual(1);
		expect(result.data[tokenID].length).toBeLessThanOrEqual(5);
	});

	it('should retrieve top token balances when called with token ID, offset=1 and limit=5', async () => {
		const response = await getTokensTopBalances({ tokenID, offset: 1, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenTopBalances);
		expect(result.data[tokenID].length).toBeGreaterThanOrEqual(0);
		expect(result.data[tokenID].length).toBeLessThanOrEqual(5);
	});

	it('should retrieve top token balances when called with token ID and search param (partial name)', async () => {
		const searchParam = tokenInfo.name ? tokenInfo.name.substring(0, 3) : '';
		const response = await getTokensTopBalances({ tokenID, search: searchParam });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenTopBalances);
		expect(result.data[tokenID].length).toBeGreaterThanOrEqual(1);
		expect(result.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('should retrieve top token balances when called with token ID and search param (partial address)', async () => {
		const searchParam = tokenInfo.address ? tokenInfo.address.substring(0, 3) : '';
		const response = await getTokensTopBalances({ tokenID, search: searchParam });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenTopBalances);
		expect(result.data[tokenID].length).toBeGreaterThanOrEqual(1);
		expect(result.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('should retrieve top token balances when called with token ID and search param (partial public key)', async () => {
		const searchParam = tokenInfo.publicKey ? tokenInfo.publicKey.substring(0, 3) : '';
		const response = await getTokensTopBalances({ tokenID, search: searchParam });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenTopBalances);
		expect(result.data[tokenID].length).toBeGreaterThanOrEqual(1);
		expect(result.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('should retrieve top token balances when called with token ID and search param (exact name)', async () => {
		const response = await getTokensTopBalances({ tokenID, search: tokenInfo.name });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenTopBalances);
		expect(result.data[tokenID].length).toBeGreaterThanOrEqual(1);
		expect(result.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('should retrieve top token balances when called with token ID and search param (exact address)', async () => {
		const response = await getTokensTopBalances({ tokenID, search: tokenInfo.address });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenTopBalances);
		expect(result.data[tokenID].length).toBeGreaterThanOrEqual(1);
		expect(result.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('should retrieve top token balances when called with token ID and search param (exact public key)', async () => {
		const response = await getTokensTopBalances({ tokenID, search: tokenInfo.publicKey });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenTopBalances);
		expect(result.data[tokenID].length).toBeGreaterThanOrEqual(1);
		expect(result.data[tokenID].length).toBeLessThanOrEqual(10);
	});

	it('should return Invalid request param when called without token ID', async () => {
		const response = await getTokensTopBalances({});
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return Invalid request param when called with invalid param', async () => {
		const response = await getTokensTopBalances({ tokenID, invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return Invalid request param when called with Invalid limit', async () => {
		const response = await getTokensTopBalances({ tokenID, limit: 'L' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return Invalid request param when called with Invalid offset', async () => {
		const response = await getTokensTopBalances({ tokenID, offset: 'L' });
		expect(response).toMap(invalidParamsSchema);
	});
});
