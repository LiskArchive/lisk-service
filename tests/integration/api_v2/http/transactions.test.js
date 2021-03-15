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
import moment from 'moment';

const config = require('../../../config');
const { api } = require('../../../helpers/api');

const {
	goodRequestSchema,
	badRequestSchema,
	notFoundSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	transactionSchemaVersion5,
} = require('../../../schemas/transaction.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;
const endpoint = `${baseUrlV2}/transactions`;

describe('Transactions API', () => {
	let refTransaction;
	let refDelegate;
	beforeAll(async () => {
		let offset = -1;
		do {
			offset++;

			// eslint-disable-next-line no-await-in-loop
			const response1 = await api.get(`${endpoint}?limit=1&offset=${offset}`);
			[refTransaction] = response1.data;
		} while (!refTransaction.asset.recipientAddress);

		const response2 = await api.get(`${baseUrlV2}/accounts?isDelegate=true&limit=1`);
		[refDelegate] = response2.data;
	});

	describe('Retrieve transaction lists', () => {
		it('returns list of transactions', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(transaction => expect(transaction).toMap(transactionSchemaVersion5));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns transactions with known moduleAssetId', async () => {
			const response = await api.get(`${endpoint}?moduleAssetId=${refTransaction.moduleAssetId}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { moduleAssetId: refTransaction.moduleAssetId }));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns transactions with known moduleAssetName', async () => {
			const response = await api.get(`${endpoint}?moduleAssetName=${refTransaction.moduleAssetName}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { moduleAssetName: refTransaction.moduleAssetName }));
			expect(response.meta).toMap(metaSchema);
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
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(transaction => expect(transaction).toMap(transactionSchemaVersion5));
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve a transaction by transaction ID', () => {
		it('returns requested transaction with known transaction id', async () => {
			const response = await api.get(`${endpoint}?id=${refTransaction.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { id: refTransaction.id }));
			expect(response.meta).toMap(metaSchema);
		});

		it('long transaction id -> 500', async () => {
			const response = await api.get(`${endpoint}?id=412875216073141752800000`, 500);
			expect(response).toMap(badRequestSchema);
		});

		it('invalid transaction id -> 500', async () => {
			const response = await api.get(`${endpoint}?id=41287`, 500);
			expect(response).toMap(notFoundSchema);
		});
	});

	describe('Retrieve transaction list by block ID', () => {
		it('known block -> ok', async () => {
			const response = await api.get(`${endpoint}?block=${refTransaction.block.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { blockId: refTransaction.blockId }));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid block -> 404', async () => {
			const response = await api.get(`${endpoint}?block=1000000000000000000000000'`, 404);
			expect(response).toMap(badRequestSchema);
		});

		it('empty block param -> ok', async () => {
			const response = await api.get(`${endpoint}?block=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(transaction => expect(transaction).toMap(transactionSchemaVersion5));
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve transaction list by height', () => {
		it('known height -> ok', async () => {
			const response = await api.get(`${endpoint}?height=${refTransaction.block.height}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { height: refTransaction.height }));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid height -> 404', async () => {
			const response = await api.get(`${endpoint}?height=1000000000000000000000000'`, 404);
			expect(response).toMap(badRequestSchema);
		});

		it('empty height -> ok', async () => {
			const response = await api.get(`${endpoint}?height=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(transaction => expect(transaction).toMap(transactionSchemaVersion5));
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve transaction list by address', () => {
		it('known address -> ok', async () => {
			const response = await api.get(`${endpoint}?address=${refTransaction.asset.recipientAddress}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid address -> 404', async () => {
			const response = await api.get(`${endpoint}?address=lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('known sender address -> ok', async () => {
			const response = await api.get(`${endpoint}?sender=${refTransaction.sender.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { senderId: refTransaction.senderId }));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid sender address -> 404', async () => {
			const response = await api.get(`${endpoint}?sender=000002345`, 404);
			expect(response).toMap(notFoundSchema);
		});
	});

	describe('Retrieve transaction list by public key', () => {
		it('existing sender public key -> ok', async () => {
			const response = await api.get(`${endpoint}?sender=publickey:${refDelegate.summary.publicKey}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { senderPublicKey: refDelegate.summary.publicKey }));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid sender query -> 404', async () => {
			const response = await api.get(`${endpoint}?sender=${refDelegate.summary.publicKey}`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('existing recipient public key -> ok', async () => {
			const response = await api.get(`${endpoint}?recipient=publickey:${refDelegate.summary.publicKey}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { recipientPublicKey: refDelegate.summary.publicKey }));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid recipient query -> 404', async () => {
			const response = await api.get(`${endpoint}?recipient=${refDelegate.summary.publicKey}`, 404);
			expect(response).toMap(notFoundSchema);
		});
	});

	describe('Retrieve transaction list by username', () => {
		it('existing sender username -> ok', async () => {
			const response = await api.get(`${endpoint}?sender=username:${refDelegate.summary.username}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { senderPublicKey: refDelegate.publicKey }));
			expect(response.meta).toMap(metaSchema);
		});

		it('existing recipient username -> ok', async () => {
			const response = await api.get(`${endpoint}?recipient=username:${refDelegate.summary.username}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { recipientPublicKey: refDelegate.publicKey }));
			expect(response.meta).toMap(metaSchema);
		});
	});


	describe('Retrieve transaction list within timestamps', () => {
		it('transactions within set timestamps are returned', async () => {
			const from = moment(refTransaction.block.timestamp).subtract(1, 'day').unix() * (10 ** 3);
			const toTimestamp = refTransaction.block.timestamp;
			const response = await api.get(`${endpoint}?timestamp=${from}:${toTimestamp}&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(transaction.block.timestamp).toBeGreaterThanOrEqual(from);
				expect(transaction.block.timestamp).toBeLessThanOrEqual(toTimestamp);
			});
			expect(response.meta).toMap(metaSchema);
		});
	});
});
