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
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	pendingTransactionSchemaVersion5,
} = require('../../../schemas/api_v2/transaction.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const getTransactions = async params => request(wsRpcUrl, 'get.transactions', params);
const postTransactions = async params => request(wsRpcUrl, 'post.transactions', params);

describe('Method get.transactions with includePending', () => {
	let refTransaction;
	beforeAll(async () => {
		await postTransactions({
			transaction: '08021000185a2080c2d72f2a20bfccf04909701c44add442c12cd86bb1332e61a70b2b6d48d97021b4dc3e6a60322b0880c2d72f1214df0e187bb3895806261c87cf66e1772566ee8e581a0e746f6b656e207472616e736665723a402957482724c3fb48770ecee577a231522edc4f774f05c0311dae990145f202e6d04b80220fcad52556604c8c7d587db87ce8e03deb038f15976286ec60cd2507',
		});
		// Wait for pending transactions list to get updated
		await new Promise(res => setTimeout(res, 10000));
		const response1 = await getTransactions({ includePending: true, limit: 1 });
		[refTransaction] = response1.result.data;
	});

	describe('is able to retrieve transaction', () => {
		it('known transaction id -> ok', async () => {
			const response = await getTransactions({
				includePending: true,
				transactionId: refTransaction.id,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeArrayOfSize(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			expect(result.data[0]).toMap(pendingTransactionSchemaVersion5);
			expect(result.data[0]).toEqual(
				expect.objectContaining({
					isPending: true,
					id: refTransaction.id,
				}),
			);
			expect(result.meta).toMap(metaSchema);
		});

		it('known transaction moduleAssetId -> ok', async () => {
			const response = await getTransactions({
				includePending: true,
				moduleAssetId: refTransaction.moduleAssetId,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			expect(result.data[0]).toMap(pendingTransactionSchemaVersion5);
			expect(result.data[0]).toEqual(
				expect.objectContaining({
					isPending: true,
					id: refTransaction.id,
				}),
			);
			expect(result.meta).toMap(metaSchema);
		});

		it('known transaction moduleAssetName -> ok', async () => {
			const response = await getTransactions({
				includePending: true,
				moduleAssetName: refTransaction.moduleAssetName,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			expect(result.data[0]).toMap(pendingTransactionSchemaVersion5);
			expect(result.data[0]).toEqual(
				expect.objectContaining({
					isPending: true,
					id: refTransaction.id,
				}),
			);
			expect(result.meta).toMap(metaSchema);
		});

		it('known transaction senderAddress -> ok', async () => {
			const response = await getTransactions({
				includePending: true,
				senderAddress: refTransaction.sender.address,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			expect(result.data[0]).toMap(pendingTransactionSchemaVersion5);
			expect(result.data[0]).toEqual(
				expect.objectContaining({
					isPending: true,
					id: refTransaction.id,
				}),
			);
			expect(result.meta).toMap(metaSchema);
		});

		it('known transaction senderUsername -> ok', async () => {
			const response = await getTransactions({
				includePending: true,
				senderUsername: refTransaction.sender.username,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			expect(result.data[0]).toMap(pendingTransactionSchemaVersion5);
			expect(result.data[0]).toEqual(
				expect.objectContaining({
					isPending: true,
					id: refTransaction.id,
				}),
			);
			expect(result.meta).toMap(metaSchema);
		});

		it('known transaction senderPublicKey -> ok', async () => {
			const response = await getTransactions({
				includePending: true,
				senderPublicKey: refTransaction.sender.publicKey,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			expect(result.data[0]).toMap(pendingTransactionSchemaVersion5);
			expect(result.data[0]).toEqual(
				expect.objectContaining({
					isPending: true,
					id: refTransaction.id,
				}),
			);
			expect(result.meta).toMap(metaSchema);
		});

		it('empty transaction id -> ok', async () => {
			const response = await getTransactions({
				includePending: true,
				transactionId: '',
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			expect(result.data[0]).toMap(pendingTransactionSchemaVersion5);
			expect(result.data[0]).toEqual(
				expect.objectContaining({
					isPending: true,
					id: refTransaction.id,
				}),
			);
			expect(result.meta).toMap(metaSchema);
		});

		it('empty transaction moduleAsset -> ok', async () => {
			const response = await getTransactions({
				includePending: true,
				moduleAssetId: '',
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			expect(result.data[0]).toMap(pendingTransactionSchemaVersion5);
			expect(result.data[0]).toEqual(
				expect.objectContaining({
					isPending: true,
					id: refTransaction.id,
				}),
			);
			expect(result.meta).toMap(metaSchema);
		});
	});
});
