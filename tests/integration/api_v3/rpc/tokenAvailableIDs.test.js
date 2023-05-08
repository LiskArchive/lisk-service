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
	goodResponseSchemaForTokenAvailableIDs,
} = require('../../../schemas/api_v3/tokenAvailableIDs.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getTokensIDs = async (params) => request(wsRpcUrl, 'get.token.available-ids', params);

describe('get.token.available-ids', () => {
	it('should retrieve available token ids when called without any parameters', async () => {
		const response = await getTokensIDs({});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenAvailableIDs);
		expect(result.data.tokenIDs.length).toBeGreaterThanOrEqual(1);
		expect(result.data.tokenIDs.length).toBeLessThanOrEqual(10);
	});

	it('should retrieve available token ids when called with sort=tokenID:asc', async () => {
		const response = await getTokensIDs({ sort: 'tokenID:asc' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenAvailableIDs);
		expect(result.data.tokenIDs.length).toBeGreaterThanOrEqual(1);
		expect(result.data.tokenIDs.length).toBeLessThanOrEqual(10);

		const isSortedAscending = result.data.tokenIDs.every((tokenID, index) => {
			if (index === 0) return true;
			return tokenID.localeCompare(result.data.tokenIDs[index - 1], 'en') >= 0;
		});
		expect(isSortedAscending).toBe(true);
	});

	it('should retrieve available token ids when called with sort=tokenID:desc', async () => {
		const response = await getTokensIDs({ sort: 'tokenID:desc' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenAvailableIDs);
		expect(result.data.tokenIDs.length).toBeGreaterThanOrEqual(1);
		expect(result.data.tokenIDs.length).toBeLessThanOrEqual(10);

		const isSortedDescending = result.data.tokenIDs.every((tokenID, index) => {
			if (index === 0) return true;
			return tokenID.localeCompare(result.data.tokenIDs[index - 1], 'en') <= 0;
		});
		expect(isSortedDescending).toBe(true);
	});

	it('should retrieve available token ids when called with offset=1', async () => {
		const response = await getTokensIDs({ offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenAvailableIDs);
		expect(result.data.tokenIDs.length).toBeGreaterThanOrEqual(0);
		expect(result.data.tokenIDs.length).toBeLessThanOrEqual(10);
	});

	it('should retrieve available token ids when called with limit=5', async () => {
		const response = await getTokensIDs({ limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenAvailableIDs);
		expect(result.data.tokenIDs.length).toBeGreaterThanOrEqual(1);
		expect(result.data.tokenIDs.length).toBeLessThanOrEqual(5);
	});

	it('should retrieve available token ids when called with offset=1 and limit=5', async () => {
		const response = await getTokensIDs({ offset: 1, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaForTokenAvailableIDs);
		expect(result.data.tokenIDs.length).toBeGreaterThanOrEqual(0);
		expect(result.data.tokenIDs.length).toBeLessThanOrEqual(5);
	});

	it('should return bad request when called with invalid param', async () => {
		const response = await getTokensIDs({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return bad request when called with Invalid limit', async () => {
		const response = await getTokensIDs({ limit: 'L' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return bad request when called with Invalid offset', async () => {
		const response = await getTokensIDs({ offset: 'L' });
		expect(response).toMap(invalidParamsSchema);
	});
});
