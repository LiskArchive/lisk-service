/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	resultEnvelopeSchema,
	emptyResultEnvelopeSchema,
	emptyResponseSchema,
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	transactionsSchemasSchema,
} = require('../../../schemas/api_v2/transactionsSchema.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const requestTransactionsSchemas = async params => request(wsRpcUrl, 'get.transactions.schemas', params);

describe('Method get.transactions.schemas', () => {
	describe('is able to retrieve transaction using transaction ID', () => {
		it('returns list of all available transaction schemas', async () => {
			const response = await requestTransactionsSchemas({});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(response.result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			result.data.forEach(schema => expect(schema).toMap(transactionsSchemasSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('returns transaction schema for known moduleAssetId', async () => {
			const response = await requestTransactionsSchemas({ moduleAssetId: '2:0' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(response.result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach(schema => expect(schema)
				.toMap(
					transactionsSchemasSchema,
					{ moduleAssetId: '2:0', moduleAssetName: 'token:transfer' },
				));
			expect(result.meta).toMap(metaSchema);
		});

		it('returns empty response for inexistent moduleAssetId', async () => {
			const response = await requestTransactionsSchemas({ moduleAssetId: '-124:999' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('returns invalid response for invalid moduleAssetId', async () => {
			const response = await requestTransactionsSchemas({ moduleAssetId: '-124' });
			expect(response).toMap(invalidParamsSchema);
		});

		it('empty moduleAssetId ->  ok', async () => {
			const response = await requestTransactionsSchemas({ moduleAssetId: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(response.result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			result.data.forEach(schema => expect(schema).toMap(transactionsSchemasSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('returns transaction schema for known moduleAssetName', async () => {
			const response = await requestTransactionsSchemas({ moduleAssetName: 'token:transfer' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(response.result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach(schema => expect(schema).toMap(transactionsSchemasSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('returns empty response for inexistent moduleAssetName', async () => {
			const response = await requestTransactionsSchemas({ moduleAssetName: 'invalid:name' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('returns invalid response for invalid moduleAssetName', async () => {
			const response = await requestTransactionsSchemas({ moduleAssetName: 'invalid_name' });
			expect(response).toMap(invalidParamsSchema);
		});

		it('empty moduleAssetName ->  ok', async () => {
			const response = await requestTransactionsSchemas({ moduleAssetName: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(response.result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			result.data.forEach(schema => expect(schema).toMap(transactionsSchemasSchema));
			expect(result.meta).toMap(metaSchema);
		});
	});
});
