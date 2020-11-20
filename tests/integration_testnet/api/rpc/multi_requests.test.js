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
const { request } = require('../../helpers/socketIoRpcMultiRequest');

const {
	resultEnvelopeSchema,
	jsonRpcEnvelopeSchema,
	jsonRpcListSchema,
	metaSchema,
	invalidParamsSchema,
	invalidRequestSchema,
	wrongMethodSchema,
} = require('../../schemas/rpcGenerics.schema');

const { accountSchema } = require('../../schemas/account.schema');
const { blockSchema } = require('../../schemas/block.schema');
const { transactionSchema } = require('../../schemas/transaction.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v1`;

const uuid = [
	'748d6b38-0614-414a-93a0-ab941e933788',
	'531e1d0e-e52d-4eea-9ebb-891f3989a03a',
	'69cbee14-87c6-443f-bf92-0d500d1daa54',
];

describe('Multi-Request API', () => {
	it('responds to a correct request', async () => {
		const multiResponse = await request(wsRpcUrl, [
			{ jsonrpc: '2.0', method: 'get.transactions', params: { limit: 1 } },
			{ jsonrpc: '2.0', method: 'get.blocks', params: { limit: 1 } },
			{ jsonrpc: '2.0', method: 'get.accounts', params: { limit: 1 } },
		]);

		expect(multiResponse).toMap(jsonRpcListSchema.length(3));

		expect(multiResponse[0]).toMap(jsonRpcEnvelopeSchema, { jsonrpc: '2.0', id: 1 });
		expect(multiResponse[0].result).toMap(resultEnvelopeSchema);
		expect(multiResponse[0].result.data).toBeArrayOfSize(1);
		multiResponse[0].result.data
			.forEach(transaction => expect(transaction).toMap(transactionSchema));
		expect(multiResponse[0].result.meta).toMap(metaSchema, { count: 1 });

		expect(multiResponse[1]).toMap(jsonRpcEnvelopeSchema, { jsonrpc: '2.0', id: 2 });
		expect(multiResponse[1].result).toMap(resultEnvelopeSchema);
		expect(multiResponse[1].result.data).toBeArrayOfSize(1);
		multiResponse[1].result.data
			.forEach(transaction => expect(transaction).toMap(blockSchema));
		expect(multiResponse[1].result.meta).toMap(metaSchema, { count: 1 });

		expect(multiResponse[2]).toMap(jsonRpcEnvelopeSchema, { jsonrpc: '2.0', id: 3 });
		expect(multiResponse[2].result).toMap(resultEnvelopeSchema);
		expect(multiResponse[2].result.data).toBeArrayOfSize(1);
		multiResponse[2].result.data
			.forEach(transaction => expect(transaction).toMap(accountSchema));
		expect(multiResponse[2].result.meta).toMap(metaSchema, { count: 1 });
	});

	it('responds to a correct request with numerical IDs', async () => {
		const multiResponse = await request(wsRpcUrl, [
			{ jsonrpc: '2.0', id: 4, method: 'get.transactions', params: { limit: 1 } },
			{ jsonrpc: '2.0', id: 5, method: 'get.blocks', params: { limit: 1 } },
			{ jsonrpc: '2.0', id: 6, method: 'get.accounts', params: { limit: 1 } },
		]);

		expect(multiResponse).toMap(jsonRpcListSchema.length(3));

		expect(multiResponse[0]).toMap(jsonRpcEnvelopeSchema, { jsonrpc: '2.0', id: 4 });
		expect(multiResponse[0].result).toMap(resultEnvelopeSchema);
		expect(multiResponse[0].result.data).toBeArrayOfSize(1);
		multiResponse[0].result.data
			.forEach(transaction => expect(transaction).toMap(transactionSchema));
		expect(multiResponse[0].result.meta).toMap(metaSchema, { count: 1 });

		expect(multiResponse[1]).toMap(jsonRpcEnvelopeSchema, { jsonrpc: '2.0', id: 5 });
		expect(multiResponse[1].result).toMap(resultEnvelopeSchema);
		expect(multiResponse[1].result.data).toBeArrayOfSize(1);
		multiResponse[1].result.data
			.forEach(transaction => expect(transaction).toMap(blockSchema));
		expect(multiResponse[1].result.meta).toMap(metaSchema, { count: 1 });

		expect(multiResponse[2]).toMap(jsonRpcEnvelopeSchema, { jsonrpc: '2.0', id: 6 });
		expect(multiResponse[2].result).toMap(resultEnvelopeSchema);
		expect(multiResponse[2].result.data).toBeArrayOfSize(1);
		multiResponse[2].result.data
			.forEach(transaction => expect(transaction).toMap(accountSchema));
		expect(multiResponse[2].result.meta).toMap(metaSchema, { count: 1 });
	});

	it('responds to a correct request with numerical UUIDs', async () => {
		const multiResponse = await request(wsRpcUrl, [
			{ jsonrpc: '2.0', id: uuid[0], method: 'get.transactions', params: { limit: 1 } },
			{ jsonrpc: '2.0', id: uuid[1], method: 'get.blocks', params: { limit: 1 } },
			{ jsonrpc: '2.0', id: uuid[2], method: 'get.accounts', params: { limit: 1 } },
		]);

		expect(multiResponse).toMap(jsonRpcListSchema.length(3));

		expect(multiResponse[0]).toMap(jsonRpcEnvelopeSchema, { jsonrpc: '2.0', id: uuid[0] });
		expect(multiResponse[0].result).toMap(resultEnvelopeSchema);
		expect(multiResponse[0].result.data).toBeArrayOfSize(1);
		multiResponse[0].result.data
			.forEach(transaction => expect(transaction).toMap(transactionSchema));
		expect(multiResponse[0].result.meta).toMap(metaSchema, { count: 1 });

		expect(multiResponse[1]).toMap(jsonRpcEnvelopeSchema, { jsonrpc: '2.0', id: uuid[1] });
		expect(multiResponse[1].result).toMap(resultEnvelopeSchema);
		expect(multiResponse[1].result.data).toBeArrayOfSize(1);
		multiResponse[1].result.data
			.forEach(transaction => expect(transaction).toMap(blockSchema));
		expect(multiResponse[1].result.meta).toMap(metaSchema, { count: 1 });

		expect(multiResponse[2]).toMap(jsonRpcEnvelopeSchema, { jsonrpc: '2.0', id: uuid[2] });
		expect(multiResponse[2].result).toMap(resultEnvelopeSchema);
		expect(multiResponse[2].result.data).toBeArrayOfSize(1);
		multiResponse[2].result.data
			.forEach(transaction => expect(transaction).toMap(accountSchema));
		expect(multiResponse[2].result.meta).toMap(metaSchema, { count: 1 });
	});

	it('returns data despite having a mix of correct and incorrect requests', async () => {
		const multiResponse = await request(wsRpcUrl, [
			{ jsonrpc: '2.0', method: 'get.transactions', params: { limit: 1 } },
			{ jsonrpc: '2.0', method: 'wrong_method', params: {} },
			{ jsonrpc: '2.0', method: 'get.accounts', params: { limit_wrong: 1 } },
		]);

		expect(multiResponse[0]).toMap(jsonRpcEnvelopeSchema, { jsonrpc: '2.0' });
		expect(multiResponse[0].result).toMap(resultEnvelopeSchema);
		expect(multiResponse[0].result.data).toBeArrayOfSize(1);
		multiResponse[0].result.data
			.forEach(transaction => expect(transaction).toMap(transactionSchema));
		expect(multiResponse[0].result.meta).toMap(metaSchema, { count: 1 });

		expect(multiResponse[1]).toMap(wrongMethodSchema);
		expect(multiResponse[2]).toMap(invalidParamsSchema);
	});

	it('supports requests with no params', async () => {
		const multiResponse = await request(wsRpcUrl, [
			{ jsonrpc: '2.0', method: 'get.transactions' },
		]);

		expect(multiResponse).toMap(jsonRpcListSchema.length(1));
		multiResponse.forEach(response => {
			expect(response).toMap(jsonRpcEnvelopeSchema, { jsonrpc: '2.0' });
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeArrayOfSize(10);
			result.data.forEach(transaction => expect(transaction).toMap(transactionSchema));
			expect(result.meta).toMap(metaSchema, { count: 10 });
		});
	});

	// Given test fails during CI phase
	xit('fails on request without the JSON-RPC envelope', async () => {
		const multiResponse = await request(wsRpcUrl, [
			{ method: 'get.transactions' },
		]);

		expect(multiResponse).toHaveLength(1);
		expect(multiResponse[0]).toMap(invalidRequestSchema);
	});

	it('fails on request without specified method', async () => {
		const multiResponse = await request(wsRpcUrl, [
			{ jsonrpc: '2.0', params: {} },
		]);

		expect(multiResponse).toHaveLength(1);
		expect(multiResponse[0]).toMap(invalidRequestSchema);
	});
});
