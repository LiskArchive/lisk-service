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
const { api } = require('../../helpers/api');

const {
	goodRequestSchema,
	badRequestSchema,
	notFoundSchema,
	metaSchema,
} = require('../../schemas/httpGenerics.schema');

const {
	transactionSchema,
} = require('../../schemas/transaction.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;
const endpoint = `${baseUrlV1}/transactions`;

describe('Transactions API', () => {
	let refTransaction;
	let refDelegate;
	beforeAll(async () => {
		const response1 = await api.get(`${endpoint}?limit=1`);
		[refTransaction] = response1.data;
		const response2 = await api.get(`${baseUrlV1}/delegates?limit=1`);
		[refDelegate] = response2.data;
	});

	describe('Retrieve transaction lists', () => {
		it('returns list of transactions', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(10);
			response.data.forEach(transaction => expect(transaction).toMap(transactionSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns transactions with known transaction type', async () => {
			const response = await api.get(`${endpoint}?type=${refTransaction.type}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(10);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchema, { type: refTransaction.type }));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid transaction type -> 400', async () => {
			const response = await api.get(`${endpoint}?type=-124`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('empty transaction type ->  ok', async () => {
			const response = await api.get(`${endpoint}?type=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(10);
			response.data.forEach(transaction => expect(transaction).toMap(transactionSchema));
			expect(response.meta).toMap(metaSchema);
		});
	});

	// TODO: meta.offset is absent
	describe('Retrieve a transaction by transaction ID', () => {
		it('returns requested transaction with known transaction id', async () => {
			const response = await api.get(`${endpoint}?id=${refTransaction.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchema, { id: refTransaction.id }));
			// expect(response.meta).toMap(metaSchema);
		});

		it('long transaction id -> 404', async () => {
			const response = await api.get(`${endpoint}?id=412875216073141752800000`, 404);
			expect(response).toMap(badRequestSchema);
		});

		it('invalid transaction id -> 404', async () => {
			const response = await api.get(`${endpoint}?id=41287`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('empty transaction id -> ok', async () => {
			const response = await api.get(`${endpoint}?block=`); expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(10);
			response.data.forEach(transaction => expect(transaction).toMap(transactionSchema));
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve transaction list by block ID', () => {
		it('known block -> ok', async () => {
			const response = await api.get(`${endpoint}?block=${refTransaction.blockId}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchema, { blockId: refTransaction.blockId }));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid block -> 404', async () => {
			const response = await api.get(`${endpoint}?block=1000000000000000000000000'`, 404);
			expect(response).toMap(badRequestSchema);
		});

		it('empty block param -> ok', async () => {
			const response = await api.get(`${endpoint}?block=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(10);
			response.data.forEach(transaction => expect(transaction).toMap(transactionSchema));
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve transaction list by height', () => {
		it('known height -> ok', async () => {
			const response = await api.get(`${endpoint}?height=${refTransaction.height}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchema, { height: refTransaction.height }));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid height -> 404', async () => {
			const response = await api.get(`${endpoint}?height=1000000000000000000000000'`, 404);
			expect(response).toMap(badRequestSchema);
		});

		it('empty height -> ok', async () => {
			const response = await api.get(`${endpoint}?height=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(10);
			response.data.forEach(transaction => expect(transaction).toMap(transactionSchema));
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve transaction list by address', () => {
		it('known address -> ok', async () => {
			const response = await api.get(`${endpoint}?address=${refTransaction.recipientId}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid address -> 404', async () => {
			const response = await api.get(`${endpoint}?address=000002345`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('known sender address -> ok', async () => {
			const response = await api.get(`${endpoint}?sender=${refTransaction.senderId}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchema, { senderId: refTransaction.senderId }));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid sender address -> 404', async () => {
			const response = await api.get(`${endpoint}?sender=000002345`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('known recipient address -> ok', async () => {
			const response = await api.get(`${endpoint}?recipient=${refTransaction.recipientId}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchema, { recipientId: refTransaction.recipientId }));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid recipient address -> 404', async () => {
			const response = await api.get(`${endpoint}?recipient=000002345`, 404);
			expect(response).toMap(notFoundSchema);
		});
	});

	describe('Retrieve transaction list by public key', () => {
		it('existing sender public key -> ok', async () => {
			const response = await api.get(`${endpoint}?sender=publickey:${refDelegate.publicKey}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchema, { senderPublicKey: refDelegate.publicKey }));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid sender query -> 404', async () => {
			const response = await api.get(`${endpoint}?sender=${refDelegate.publicKey}`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('existing recipient public key -> ok', async () => {
			const response = await api.get(`${endpoint}?recipient=publickey:${refDelegate.publicKey}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchema, { recipientPublicKey: refDelegate.publicKey }));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid recipient query -> 404', async () => {
			const response = await api.get(`${endpoint}?recipient=${refDelegate.publicKey}`, 404);
			expect(response).toMap(notFoundSchema);
		});
	});

	describe('Retrieve transaction list by username', () => {
		it('existing sender username -> ok', async () => {
			const response = await api.get(`${endpoint}?sender=username:${refDelegate.username}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchema, { senderPublicKey: refDelegate.publicKey }));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid sender query -> 404', async () => {
			const response = await api.get(`${endpoint}?sender=${refDelegate.username}`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('existing recipient username -> ok', async () => {
			const response = await api.get(`${endpoint}?recipient=username:${refDelegate.username}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchema, { recipientPublicKey: refDelegate.publicKey }));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid recipient query -> 404', async () => {
			const response = await api.get(`${endpoint}?recipient=${refDelegate.username}`, 404);
			expect(response).toMap(notFoundSchema);
		});
	});

	xdescribe('Retrieve transaction list by second public key', () => {
	});

	describe('Retrieve transaction list within timestamps', () => {
		it('transactions within set timestamps are returned', async () => {
			const from = 1497856679;
			const toTimestamp = refTransaction.timestamp;
			const response = await api.get(`${endpoint}?from=${from}&to=${toTimestamp}&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.timestamp).toBeGreaterThanOrEqual(from);
				expect(transaction.timestamp).toBeLessThanOrEqual(toTimestamp);
			});
			expect(response.meta).toMap(metaSchema);
		});
	});
});
