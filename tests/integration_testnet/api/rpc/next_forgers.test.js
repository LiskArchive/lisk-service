/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const config = require('../../config');
const { request } = require('../../helpers/socketIoRpcRequest');

const {
	resultEnvelopeSchema,
	emptyResponseSchema,
	emptyResultEnvelopeSchema,
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../schemas/rpcGenerics.schema');

const {
	delegateSchema,
} = require('../../schemas/delegate.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v1`;
const getNextForgers = async params => request(wsRpcUrl, 'get.delegates.next_forgers', params);

describe('Method get.next_forgers', () => {
	it('returns 10 forgers when no params specified', async () => {
		const response = await getNextForgers({});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(resultEnvelopeSchema);
		expect(result.data).toBeArrayOfSize(10);
		result.data.forEach(delegate => expect(delegate).toMap(delegateSchema));
		expect(result.meta).toMap(metaSchema, { count: 10, offset: 0 });
	});

	it('returns 100 forgers when limit = 100', async () => {
		const limit = 100;
		const response = await getNextForgers({ limit });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(resultEnvelopeSchema);
		expect(result.data).toBeArrayOfSize(limit);
		result.data.forEach(delegate => expect(delegate).toMap(delegateSchema));
		expect(result.meta).toMap(metaSchema, { count: limit, offset: 0 });
	});

	it('returns 10 forgers when offset is specified', async () => {
		const offset = 10;
		const response = await getNextForgers({ offset });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(resultEnvelopeSchema);
		expect(result.data).toBeArrayOfSize(10);
		result.data.forEach(delegate => expect(delegate).toMap(delegateSchema));
		expect(result.meta).toMap(metaSchema, { count: 10, offset });
	});

	it(`returns INVALID_PARAMS (-32602) when limit = 0`, async () => {
		const error = await getNextForgers({ limit: 0 }).catch(e => e);
		expect(error).toMap(invalidParamsSchema);
	});

	// Given test fails during CI phase
	xit('returns empty response when limit is empty', async () => {
		const response = await getNextForgers({ limit: '' });
		expect(response).toMap(emptyResponseSchema);
		const { result } = response;
		expect(result).toMap(emptyResultEnvelopeSchema);
	});
});
