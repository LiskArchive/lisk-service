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
const { api } = require('../../../helpers/api');

const {
	goodRequestSchema,
	badRequestSchema,
	notFoundSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	transactionsSchemasSchema,
} = require('../../../schemas/api_v2/transactionsSchema.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;
const endpoint = `${baseUrlV2}/transactions/schemas`;

describe('Transactions Schemas API', () => {
	describe('Retrieve transaction schemas', () => {
		it('returns list of all available transaction schemas', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(schema => expect(schema).toMap(transactionsSchemasSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns transaction schema for known moduleAssetId', async () => {
			const response = await api.get(`${endpoint}?moduleAssetId=2:0`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(1);
			response.data.forEach(schema => expect(schema)
				.toMap(
					transactionsSchemasSchema,
					{ moduleAssetId: '2:0', moduleAssetName: 'token:transfer' },
				));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns transactions with known moduleAssetName', async () => {
			const response = await api.get(`${endpoint}?moduleAssetName=token:transfer`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(1);
			response.data.forEach(schema => expect(schema)
				.toMap(
					transactionsSchemasSchema,
					{ moduleAssetId: '2:0', moduleAssetName: 'token:transfer' },
				));
			expect(response.meta).toMap(metaSchema);
		});

		it('inexistent moduleAssetId -> 404', async () => {
			const response = await api.get(`${endpoint}?moduleAssetId=-124:999`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('invalid moduleAssetId -> 400', async () => {
			const response = await api.get(`${endpoint}?moduleAssetId=-124`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('empty moduleAssetId ->  ok', async () => {
			const response = await api.get(`${endpoint}?moduleAssetId=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(schema => expect(schema).toMap(transactionsSchemasSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('inexistent moduleAssetName -> 404', async () => {
			const response = await api.get(`${endpoint}?moduleAssetName=inexistent:name`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('invalid moduleAssetName -> 400', async () => {
			const response = await api.get(`${endpoint}?moduleAssetName=invalid_name`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('empty moduleAssetName ->  ok', async () => {
			const response = await api.get(`${endpoint}?moduleAssetName=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(schema => expect(schema).toMap(transactionsSchemasSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid param -> 400', async () => {
			const response = await api.get(`${endpoint}?invalid_param=invalid_param`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});
});
