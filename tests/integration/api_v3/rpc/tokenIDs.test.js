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
	goodResponseSchemaFortokenIDs,
} = require('../../../schemas/api_v3/tokenIDs.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getTokensIds = async (params) => request(wsRpcUrl, 'get.token.ids', params);

describe('get.token.ids', () => {
	beforeAll(async () => {
	});

	it('returns tokens info when call with address', async () => {
		const response = await getTokensIds({});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaFortokenIDs);
		expect(result.data.tokenIDs.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of stakers when requested with known validator name and offset=1', async () => {
		const response = await getTokensIds({ offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaFortokenIDs);
		expect(result.data.tokenIDs.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of stakers when requested with known validator name and limit=5', async () => {
		const response = await getTokensIds({ limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaFortokenIDs);
		expect(result.data.tokenIDs.length).toBeLessThanOrEqual(5);
	});

	it('Returns list of stakers when requested with known validator name, offset=1 and limit=5', async () => {
		const response = await getTokensIds({ offset: 1, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchemaFortokenIDs);
		expect(result.data.tokenIDs.length).toBeLessThanOrEqual(5);
	});

	it('Invalid request param -> invalid param', async () => {
		const response = await getTokensIds({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid limit -> invalid param', async () => {
		const response = await getTokensIds({ limit: 'L' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid offset -> invalid param', async () => {
		const response = await getTokensIds({ offset: 'L' });
		expect(response).toMap(invalidParamsSchema);
	});
});
