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
		} while (!refTransaction.asset.recipient);

		try {
			const response2 = await api.get(`${baseUrlV2}/accounts?isDelegate=true&search=test_delegate`);
			[refDelegate] = response2.data;
		} catch (_) {
			const response3 = await api.get(`${baseUrlV2}/accounts?isDelegate=true&limit=1`);
			[refDelegate] = response3.data;
		}
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
			const response = await api.get(`${endpoint}?transactionId=${refTransaction.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { id: refTransaction.id }));
			expect(response.meta).toMap(metaSchema);
		});

		it('long transaction id -> 400', async () => {
			const response = await api.get(`${endpoint}?transactionId=a0833fb5b5534a0c53c3a766bf356c92df2a28e1730fba85667b24f139f65b35578`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('invalid transaction id -> 404', async () => {
			const response = await api.get(`${endpoint}?transactionId=41287`, 404);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve transaction list by block ID', () => {
		it('known block -> ok', async () => {
			const response = await api.get(`${endpoint}?blockId=${refTransaction.block.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { blockId: refTransaction.blockId }));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid block -> 404', async () => {
			const response = await api.get(`${endpoint}?blockId=1000000000000000000000000'`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('empty block param -> ok', async () => {
			const response = await api.get(`${endpoint}?blockId=`);
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
			expect(response).toMap(notFoundSchema);
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

	describe('Retrieve transaction list by sender/recipient address', () => {
		it('known address -> ok', async () => {
			const response = await api.get(`${endpoint}?recipientAddress=${refTransaction.asset.recipient.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(transaction.asset.recipient.address).toEqual(refTransaction.asset.recipient.address);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid address -> 400', async () => {
			const response = await api.get(`${endpoint}?senderAddress=lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('known sender address -> ok', async () => {
			const response = await api.get(`${endpoint}?senderAddress=${refTransaction.sender.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(transaction.sender.address).toEqual(refTransaction.sender.address);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid sender address -> 400', async () => {
			const response = await api.get(`${endpoint}?senderAddress=000002345`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve transaction list by address', () => {
		it('known address -> ok', async () => {
			const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				if (transaction.asset.recipient) {
					expect([transaction.sender.address, transaction.asset.recipient.address])
						.toContain(refTransaction.sender.address);
				} else {
					expect(transaction.sender.address).toMatch(refTransaction.sender.address);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid address -> 400', async () => {
			const response = await api.get(`${endpoint}?address=lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve transaction list by sender public key', () => {
		it('existing sender public key -> ok', async () => {
			const response = await api.get(`${endpoint}?senderPublicKey=${refDelegate.summary.publicKey}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(transaction.sender.publicKey).toEqual(refDelegate.summary.publicKey);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('existing recipient public key -> ok', async () => {
			const response = await api.get(`${endpoint}?recipientPublicKey=${refDelegate.summary.publicKey}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(transaction.asset.recipient.address).toEqual(refDelegate.summary.address);
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve transaction list by username', () => {
		it('existing sender username -> ok', async () => {
			const response = await api.get(`${endpoint}?senderUsername=${refDelegate.summary.username}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { senderPublicKey: refDelegate.publicKey }));
			expect(response.meta).toMap(metaSchema);
		});

		it('existing recipient username -> ok', async () => {
			const response = await api.get(`${endpoint}?recipientUsername=${refDelegate.summary.username}`);
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
			const from = moment(refTransaction.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const toTimestamp = refTransaction.block.timestamp;
			const response = await api.get(`${endpoint}?timestamp=${from}:${toTimestamp}&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(transaction.block.timestamp).toBeGreaterThanOrEqual(from);
				expect(transaction.block.timestamp).toBeLessThanOrEqual(toTimestamp);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('transactions with half bounded range: fromTimestamp', async () => {
			const from = moment(refTransaction.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const response = await api.get(`${endpoint}?timestamp=${from}:&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(transaction.block.timestamp).toBeGreaterThanOrEqual(from);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('transactions with half bounded range: toTimestamp', async () => {
			const toTimestamp = refTransaction.block.timestamp;
			const response = await api.get(`${endpoint}?timestamp=:${toTimestamp}&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(transaction.block.timestamp).toBeLessThanOrEqual(toTimestamp);
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve transaction list within amount range', () => {
		it('transactions within set amount range are returned', async () => {
			const minAmount = 0;
			const maxAmount = BigInt(refTransaction.asset.amount);
			const response = await api.get(`${endpoint}?amount=${minAmount}:${maxAmount}&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(BigInt(transaction.asset.amount)).toBeGreaterThanOrEqual(minAmount);
				expect(BigInt(transaction.asset.amount)).toBeLessThanOrEqual(maxAmount);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('transactions with half bounded range: minAmount', async () => {
			const minAmount = 0;
			const response = await api.get(`${endpoint}?amount=${minAmount}:&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(BigInt(transaction.asset.amount)).toBeGreaterThanOrEqual(minAmount);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('transactions with half bounded range: maxAmount', async () => {
			const maxAmount = BigInt(refTransaction.asset.amount);
			const response = await api.get(`${endpoint}?amount=:${maxAmount}&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(BigInt(transaction.asset.amount)).toBeLessThanOrEqual(maxAmount);
			});
			expect(response.meta).toMap(metaSchema);
		});
	});
});
