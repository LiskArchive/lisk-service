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
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	pendingTransactionSchemaVersion5,
} = require('../../../schemas/transaction.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;
const endpoint = `${baseUrlV2}/transactions`;

describe('Pending transactions API', () => {
	let refTransaction;
	beforeAll(async () => {
		await api.post(endpoint,
			{ transaction: '0802100018782080c2d72f2a20bfccf04909701c44add442c12cd86bb1332e61a70b2b6d48d97021b4dc3e6a60322b0880c2d72f1214df0e187bb3895806261c87cf66e1772566ee8e581a0e746f6b656e207472616e736665723a4022a7f6be7b6e31112adf0e5b2f4a2e092c4568118587a2e681ccab24a68c7531c68ccf79e0ed88633ae5020b6f3d1d647e1a178bdf088c33f78f80eb9fc2b90b' },
		);
		await new Promise(res => setTimeout(res, 10000));
		const response1 = await api.get(`${endpoint}?includePending=true&limit=1`);
		[refTransaction] = response1.data;
	});

	describe('Retrieve pending transaction by query params', () => {
		it('returns transaction with transactionId', async () => {
			const response = await api.get(`${endpoint}?includePending=true&transactionId=${refTransaction.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data).toBeArrayOfSize(1);
			expect(response.data[0]).toMap(pendingTransactionSchemaVersion5);
			expect(response.data[0]).toEqual(
				expect.objectContaining({
					isPending: true,
				}),
			);
			expect(response.meta).toMap(metaSchema);
		});

		it('returns transactions with known moduleAssetName', async () => {
			const response = await api.get(`${endpoint}?includePending=true&moduleAssetName=${refTransaction.moduleAssetName}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			expect(response.data[0]).toMap(pendingTransactionSchemaVersion5);
			expect(response.data[0]).toEqual(
				expect.objectContaining({
					isPending: true,
				}),
			);
			expect(response.meta).toMap(metaSchema);
		});

		it('returns transactions with known moduleAssetId', async () => {
			const response = await api.get(`${endpoint}?includePending=true&moduleAssetId=${refTransaction.moduleAssetId}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			expect(response.data[0]).toMap(pendingTransactionSchemaVersion5);
			expect(response.data[0]).toEqual(
				expect.objectContaining({
					isPending: true,
				}),
			);
			expect(response.meta).toMap(metaSchema);
		});

		it('returns transactions with known sender address', async () => {
			const response = await api.get(`${endpoint}?includePending=true&senderAddress=${refTransaction.sender.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			expect(response.data[0]).toMap(pendingTransactionSchemaVersion5);
			expect(response.data[0]).toEqual(
				expect.objectContaining({
					isPending: true,
				}),
			);
			expect(response.meta).toMap(metaSchema);
		});

		it('returns transactions with known sender publicKey', async () => {
			const response = await api.get(`${endpoint}?includePending=true&senderPublicKey=${refTransaction.sender.publicKey}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			expect(response.data[0]).toMap(pendingTransactionSchemaVersion5);
			expect(response.data[0]).toEqual(
				expect.objectContaining({
					isPending: true,
				}),
			);
			expect(response.meta).toMap(metaSchema);
		});

		it('returns transactions with known sender username', async () => {
			const response = await api.get(`${endpoint}?includePending=true&senderUsername=${refTransaction.sender.username}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			expect(response.data[0]).toMap(pendingTransactionSchemaVersion5);
			expect(response.data[0]).toEqual(
				expect.objectContaining({
					isPending: true,
				}),
			);
			expect(response.meta).toMap(metaSchema);
		});
	});
});
