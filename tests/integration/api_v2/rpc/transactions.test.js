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
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	resultEnvelopeSchema,
	emptyResultEnvelopeSchema,
	emptyResponseSchema,
	jsonRpcEnvelopeSchema,
	invalidParamsSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	transactionSchemaVersion5,
} = require('../../../schemas/transaction.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const getTransactions = async params => request(wsRpcUrl, 'get.transactions', params);
const getDelegates = async params => request(wsRpcUrl, 'get.accounts', { ...params, isDelegate: true });

describe('Method get.transactions', () => {
	let refTransaction;
	let refDelegate;
	beforeAll(async () => {
		const response1 = await getTransactions({ moduleAssetId: '2:0', limit: 1 });
		[refTransaction] = response1.result.data;

		try {
			const response2 = await getDelegates({ search: 'test_delegate' });
			[refDelegate] = response2.result.data;
			if (!refDelegate) throw new Error();
		} catch (_) {
			const response2 = await getDelegates({ limit: 1 });
			[refDelegate] = response2.result.data;
		}
	});

	describe('is able to retrieve transaction using transaction ID', () => {
		it('known transaction id -> ok', async () => {
			const response = await getTransactions({ transactionId: refTransaction.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeArrayOfSize(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { id: refTransaction.id }));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty transaction id -> empty response', async () => {
			const response = await getTransactions({ transactionId: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using block ID', () => {
		it('known block -> ok', async () => {
			const response = await getTransactions({ blockId: refTransaction.block.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction).toMap(transactionSchemaVersion5));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty block ->  empty response', async () => {
			const response = await getTransactions({ blockId: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using moduleAssets', () => {
		it('known transaction moduleAssetId -> ok', async () => {
			const response = await getTransactions({ moduleAssetId: refTransaction.moduleAssetId });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { moduleAssetId: refTransaction.moduleAssetId }));
			expect(result.meta).toMap(metaSchema);
		});

		it('known transaction moduleAssetName -> ok', async () => {
			const response = await getTransactions({
				moduleAssetName: refTransaction.moduleAssetName,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { moduleAssetName: refTransaction.moduleAssetName }));
			expect(result.meta).toMap(metaSchema);
		});

		it('invalid transaction moduleAssets -> empty response', async () => {
			const response = await getTransactions({ moduleAssetId: '999' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('empty transaction moduleAsset -> empty response', async () => {
			const response = await getTransactions({ moduleAssetId: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using sender attributes', () => {
		it('known sender address -> ok', async () => {
			const response = await getTransactions({ senderAddress: refTransaction.sender.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(transaction.sender.address).toEqual(refTransaction.sender.address);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('invalid sender address -> invalid params', async () => {
			const response = await getTransactions({ senderAddress: 'lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj' });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retrieve list of transactions using recipient attributes', () => {
		it('known recipient address -> ok', async () => {
			const response = await getTransactions({
				recipientAddress: refTransaction.asset.recipient.address,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(transaction.asset.recipient.address).toEqual(refTransaction.asset.recipient.address);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('invalid recipient address -> invalid params', async () => {
			const response = await getTransactions({ recipientAddress: 'lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj' });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retrieve list of transactions by address', () => {
		it('known address -> ok', async () => {
			const response = await getTransactions({ address: refTransaction.sender.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				if (transaction.asset.recipient) {
					expect([transaction.sender.address, transaction.asset.recipient.address])
						.toContain(refTransaction.sender.address);
				} else {
					expect(transaction.sender.address).toMatch(refTransaction.sender.address);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('invalid address -> invalid params', async () => {
			const response = await getTransactions({ address: 'lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj' });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retrieve list of transactions using height', () => {
		it('known height -> ok', async () => {
			const response = await getTransactions({ height: String(refTransaction.block.height) });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { height: refTransaction.height }));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty height -> empty response', async () => {
			const response = await getTransactions({ height: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using timestamps', () => {
		it('from to -> ok', async () => {
			const from = moment(refTransaction.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const toTimestamp = refTransaction.block.timestamp;
			const response = await getTransactions({ timestamp: `${from}:${toTimestamp}` });

			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(transaction.block.timestamp).toBeGreaterThanOrEqual(from);
				expect(transaction.block.timestamp).toBeLessThanOrEqual(toTimestamp);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('Half bounded range from -> ok', async () => {
			const from = moment(refTransaction.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const response = await getTransactions({ timestamp: `${from}:` });

			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(transaction.block.timestamp).toBeGreaterThanOrEqual(from);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('Half bounded range to -> ok', async () => {
			const toTimestamp = refTransaction.block.timestamp;
			const response = await getTransactions({ timestamp: `:${toTimestamp}` });

			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(transaction.block.timestamp).toBeLessThanOrEqual(toTimestamp);
			});
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('is able to retrieve list of transactions using amount range', () => {
		it('min max amount -> ok', async () => {
			const minAmount = 0;
			const maxAmount = BigInt(refTransaction.asset.amount);
			const response = await getTransactions({ amount: `${minAmount}:${maxAmount}` });

			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(BigInt(transaction.asset.amount)).toBeGreaterThanOrEqual(minAmount);
				expect(BigInt(transaction.asset.amount)).toBeLessThanOrEqual(maxAmount);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('Half bounded range minAmount -> ok', async () => {
			const minAmount = 0;
			const response = await getTransactions({ amount: `${minAmount}:` });

			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(BigInt(transaction.asset.amount)).toBeGreaterThanOrEqual(minAmount);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('Half bounded range maxAmount -> ok', async () => {
			const maxAmount = BigInt(refTransaction.asset.amount);
			const response = await getTransactions({ amount: `:${maxAmount}` });

			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(BigInt(transaction.asset.amount)).toBeLessThanOrEqual(maxAmount);
			});
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Transactions sorted by timestamp', () => {
		it('returns 10 transactions sorted by timestamp descending', async () => {
			const response = await getTransactions({ sort: 'timestamp:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction).toMap(transactionSchemaVersion5));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevTransaction = result.data[i - 1];
					const currTransaction = result.data[i];
					expect(prevTransaction.block.timestamp)
						.toBeGreaterThanOrEqual(currTransaction.block.timestamp);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('returns 10 transactions sorted by timestamp ascending', async () => {
			const response = await getTransactions({ sort: 'timestamp:asc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction).toMap(transactionSchemaVersion5));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevTransaction = result.data[i - 1];
					const currTransaction = result.data[i];
					expect(prevTransaction.block.timestamp)
						.toBeLessThanOrEqual(currTransaction.block.timestamp);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Transactions sorted by amount', () => {
		it('returns 10 transactions sorted by amount descending', async () => {
			const response = await getTransactions({ sort: 'amount:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction).toMap(transactionSchemaVersion5));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevTransaction = result.data[i - 1];
					const currTransaction = result.data[i];
					expect(BigInt(prevTransaction.asset.amount))
						.toBeGreaterThanOrEqual(BigInt(currTransaction.asset.amount));
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('returns 10 transactions sorted by amount ascending', async () => {
			const response = await getTransactions({ sort: 'amount:asc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction).toMap(transactionSchemaVersion5));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevTransaction = result.data[i - 1];
					const currTransaction = result.data[i];
					expect(BigInt(prevTransaction.asset.amount))
						.toBeLessThanOrEqual(BigInt(currTransaction.asset.amount));
				}
			}
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Fetch transactions based on multiple request params', () => {
		it('returns transactions with senderAddress and nonce', async () => {
			const response = await getTransactions({
				senderAddress: refDelegate.summary.address,
				nonce: String(Number(refDelegate.sequence.nonce) - 1),
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(transaction.sender.address).toBe(refDelegate.summary.address);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns transactions with senderAddress and nonce (incorrect data type)', async () => {
			const response = await getTransactions({
				senderAddress: refDelegate.summary.address,
				nonce: Number(refDelegate.sequence.nonce) - 1,
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('returns transactions with senderPublicKey and nonce', async () => {
			const response = await getTransactions({
				senderPublicKey: refDelegate.summary.publicKey,
				nonce: String(Number(refDelegate.sequence.nonce) - 1),
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(transaction.sender.publicKey).toBe(refDelegate.summary.publicKey);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns transactions with address and nonce', async () => {
			const response = await getTransactions({
				address: refDelegate.summary.address,
				nonce: String(Number(refDelegate.sequence.nonce) - 1),
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('returns invalid params response with senderUsername and nonce', async () => {
			const response = await getTransactions({
				senderUsername: refDelegate.summary.username,
				nonce: String(Number(refDelegate.sequence.nonce) - 1),
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('returns invalid params response with recipientAddress and nonce', async () => {
			const response = await getTransactions({
				recipientAddress: refDelegate.summary.address,
				nonce: String(Number(refDelegate.sequence.nonce) - 1),
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('returns invalid params response with recipientPublicKey and nonce', async () => {
			const response = await getTransactions({
				recipientPublicKey: refDelegate.summary.publicKey,
				nonce: String(Number(refDelegate.sequence.nonce) - 1),
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('returns invalid params response with recipientUsername and nonce', async () => {
			const response = await getTransactions({
				recipientUsername: refDelegate.summary.username,
				nonce: String(Number(refDelegate.sequence.nonce) - 1),
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('returns empty response when queried with transactionId and non-zero offset', async () => {
			const response = await getTransactions({ transactionId: refTransaction.id, offset: 1 });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('returns transaction when queried with transactionId and blockId', async () => {
			const response = await getTransactions({
				transactionId: refTransaction.id,
				blockId: refTransaction.block.id,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(transaction.id).toBe(refTransaction.id);
				expect(transaction.block.id).toBe(refTransaction.block.id);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns transaction when queried with transactionId and height', async () => {
			const response = await getTransactions({
				transactionId: refTransaction.id,
				height: String(refTransaction.height),
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				expect(transaction.id).toBe(refTransaction.id);
				expect(transaction.height).toBe(refTransaction.height);
			});
			expect(result.meta).toMap(metaSchema);
		});

		// TODO: Re-enable after test blockchain update with transaction data
		xit('returns transactions when queried with data', async () => {
			const response = await getTransactions({ data: refTransaction.asset.data });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				const txData = transaction.asset.data;
				const refTxData = refTransaction.asset.data;
				expect(txData === refTxData || txData.includes(refTxData)).toBeTruthy();
			});
			expect(result.meta).toMap(metaSchema);
		});

		// TODO: Re-enable after test blockchain update with transaction data
		xit('returns transactions when queried with data, limit and offset', async () => {
			try {
				const response = await getTransactions({
					data: refTransaction.asset.data,
					limit: 5,
					offset: 1,
				});
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result.data).toBeInstanceOf(Array);
				expect(result.data.length).toBeGreaterThanOrEqual(1);
				expect(result.data.length).toBeLessThanOrEqual(5);
				result.data.forEach(transaction => {
					expect(transaction).toMap(transactionSchemaVersion5);
					const txData = transaction.asset.data;
					const refTxData = refTransaction.asset.data;
					expect(txData === refTxData || txData.includes(refTxData)).toBeTruthy();
				});
				expect(result.meta).toMap(metaSchema);
			} catch (_) {
				const response = await getTransactions({
					data: refTransaction.asset.data,
					limit: 5,
					offset: 1,
				});
				expect(response).toMap(emptyResponseSchema);
				const { result } = response;
				expect(result).toMap(emptyResultEnvelopeSchema);
			}
		});

		it('returns transactions when queried with search', async () => {
			const response = await getTransactions({ search: refDelegate.summary.username });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchemaVersion5);
				const {
					publicKey: senderPublicKey,
					address: senderAddress,
					username: senderUserName,
				} = transaction.sender;
				const { recipient: {
					publicKey: recipientPublicKey,
					address: recipientAddress,
					username: recipientUsername,
				} = {} } = transaction.asset;
				const {
					username: assetUserName,
				} = transaction.asset;

				if (assetUserName) {
					expect(assetUserName).toBe(refDelegate.summary.username);
					expect(senderUserName).toBe(refDelegate.summary.username);
				}

				expect([senderAddress, recipientAddress]).toContain(refDelegate.summary.address);
				expect([senderPublicKey, recipientPublicKey]).toContain(refDelegate.summary.publicKey);
				expect([senderUserName, recipientUsername, assetUserName])
					.toContain(refDelegate.summary.username);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns transactions when queried with search, limit and offset', async () => {
			try {
				const response = await getTransactions({
					search: refDelegate.summary.username,
					limit: 5,
					offset: 1,
				});
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result.data).toBeInstanceOf(Array);
				expect(result.data.length).toBeGreaterThanOrEqual(1);
				expect(result.data.length).toBeLessThanOrEqual(10);
				result.data.forEach(transaction => {
					expect(transaction).toMap(transactionSchemaVersion5);
					const {
						publicKey: senderPublicKey,
						address: senderAddress,
						username: senderUserName,
					} = transaction.sender;
					const { recipient: {
						publicKey: recipientPublicKey,
						address: recipientAddress,
						username: recipientUsername,
					} = {} } = transaction.asset;
					const {
						username: assetUserName,
					} = transaction.asset;

					if (assetUserName) {
						expect(assetUserName).toBe(refDelegate.summary.username);
						expect(senderUserName).toBe(refDelegate.summary.username);
					}

					expect([senderPublicKey, recipientPublicKey]).toContain(refDelegate.summary.publicKey);
					expect([senderAddress, recipientAddress]).toContain(refDelegate.summary.address);
					expect([senderUserName, recipientUsername, assetUserName])
						.toContain(refDelegate.summary.username);
				});
				expect(result.meta).toMap(metaSchema);
			} catch (_) {
				const response = await getTransactions({
					search: refDelegate.summary.username,
					limit: 5,
					offset: 1,
				});
				expect(response).toMap(emptyResponseSchema);
				const { result } = response;
				expect(result).toMap(emptyResultEnvelopeSchema);
			}
		});
	});
});
