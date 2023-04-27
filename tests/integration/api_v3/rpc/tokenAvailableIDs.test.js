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
	goodResponseSchemaFortokenAvailableIDs,
} = require('../../../schemas/api_v3/tokenAvailableIDs.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getTokensIDs = async (params) => request(wsRpcUrl, 'get.token.available-ids', params);

describe('get.token.available-ids', () => {
	it('returns token ids when call without any parameters', async () => {
		const response = await getTokensIDs({});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaFortokenAvailableIDs);
		expect(result.data.tokenIDs.length).toBeGreaterThanOrEqual(1);
		expect(result.data.tokenIDs.length).toBeLessThanOrEqual(10);
	});

	it('Should retrieves token ids when called with offset=1', async () => {
		const response = await getTokensIDs({ offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaFortokenAvailableIDs);
		expect(result.data.tokenIDs.length).toBeGreaterThanOrEqual(0);
		expect(result.data.tokenIDs.length).toBeLessThanOrEqual(10);
	});

	it('Should retrieves token ids when called with limit=5', async () => {
		const response = await getTokensIDs({ limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaFortokenAvailableIDs);
		expect(result.data.tokenIDs.length).toBeGreaterThanOrEqual(1);
		expect(result.data.tokenIDs.length).toBeLessThanOrEqual(5);
	});

	it('Should retrieves token ids when called with offset=1 and limit=5', async () => {
		const response = await getTokensIDs({ offset: 1, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaFortokenAvailableIDs);
		expect(result.data.tokenIDs.length).toBeGreaterThanOrEqual(0);
		expect(result.data.tokenIDs.length).toBeLessThanOrEqual(5);
	});

	it('Invalid request param -> invalid param', async () => {
		const response = await getTokensIDs({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid limit -> invalid param', async () => {
		const response = await getTokensIDs({ limit: 'L' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid offset -> invalid param', async () => {
		const response = await getTokensIDs({ offset: 'L' });
		expect(response).toMap(invalidParamsSchema);
	});
});
