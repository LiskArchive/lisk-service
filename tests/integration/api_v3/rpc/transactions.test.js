/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
	transactionSchema,
} = require('../../../schemas/api_v3/transaction.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getTransactions = async params => request(wsRpcUrl, 'get.transactions', params);

describe('Method get.transactions', () => {
	let refTransaction;
	beforeAll(async () => {
		const response = await getTransactions({ moduleCommand: 'token:transfer', limit: 1 });
		[refTransaction] = response.result.data;
	});

	describe('Retrieve transactions', () => {
		it('returns list of transactions', async () => {
			const response = await getTransactions({});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('is able to retrieve transaction using transactionID', () => {
		it('known transactionID -> ok', async () => {
			const response = await getTransactions({ transactionID: refTransaction.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeArrayOfSize(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((transaction, i) => {
				expect(transaction)
					.toMap(transactionSchema, { id: refTransaction.id });
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('empty transactionID -> empty response', async () => {
			const response = await getTransactions({ transactionID: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using blockID', () => {
		it('known blockID -> ok', async () => {
			const response = await getTransactions({ blockID: refTransaction.block.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction).toMap(transactionSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty blockID ->  empty response', async () => {
			const response = await getTransactions({ blockID: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using moduleCommand', () => {
		it('known transaction moduleCommand -> ok', async () => {
			const response = await getTransactions({
				moduleCommand: refTransaction.moduleCommand,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((transaction, i) => {
				expect(transaction)
					.toMap(transactionSchema, { moduleCommand: refTransaction.moduleCommand });
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('invalid transaction moduleCommand -> empty response', async () => {
			const response = await getTransactions({ moduleCommand: '999' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('empty transaction moduleCommand -> empty response', async () => {
			const response = await getTransactions({ moduleCommand: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using senderAddress', () => {
		it('known senderAddress -> ok', async () => {
			const response = await getTransactions({ senderAddress: refTransaction.sender.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.sender.address).toEqual(refTransaction.sender.address);
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('empty senderAddress -> empty response', async () => {
			const response = await getTransactions({ senderAddress: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('invalid senderAddress -> invalid params', async () => {
			const response = await getTransactions({ senderAddress: 'lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj' });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retrieve list of transactions using recipientAddress', () => {
		it('known recipientAddress -> ok', async () => {
			const response = await getTransactions({
				recipientAddress: refTransaction.params.recipientAddress,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.params.recipientAddress).toEqual(refTransaction.params.recipientAddress);
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('empty recipientAddress -> empty response', async () => {
			const response = await getTransactions({ recipientAddress: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('invalid recipientAddress -> invalid params', async () => {
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
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (transaction.params.recipientAddress) {
					expect([transaction.sender.address, transaction.params.recipientAddress])
						.toContain(refTransaction.sender.address);
				} else {
					expect(transaction.sender.address).toMatch(refTransaction.sender.address);
				}
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
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
				.toMap(transactionSchema, { height: refTransaction.block.height }));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty height -> empty response', async () => {
			const response = await getTransactions({ height: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('Blocks with min...max height -> ok', async () => {
			const minHeight = refTransaction.block.height;
			const maxHeight = refTransaction.block.height + 100;
			const response = await getTransactions({ height: `${minHeight}:${maxHeight}` });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.block.height).toBeGreaterThanOrEqual(minHeight);
				expect(transaction.block.height).toBeLessThanOrEqual(maxHeight);
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('Blocks with min... height -> ok', async () => {
			const minHeight = refTransaction.block.height;
			const response = await getTransactions({ height: `${minHeight}:` });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.block.height).toBeGreaterThanOrEqual(minHeight);
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('Blocks with ...max height -> ok', async () => {
			const maxHeight = refTransaction.block.height + 100;
			const response = await getTransactions({ height: `:${maxHeight}` });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.block.height).toBeLessThanOrEqual(maxHeight);
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('Blocks with max...min height -> empty response', async () => {
			const minHeight = refTransaction.block.height;
			const maxHeight = refTransaction.block.height + 100;
			const response = await getTransactions({ height: `${maxHeight}:${minHeight}` });
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
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.block.timestamp).toBeGreaterThanOrEqual(from);
				expect(transaction.block.timestamp).toBeLessThanOrEqual(toTimestamp);
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
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
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.block.timestamp).toBeGreaterThanOrEqual(from);
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
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
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.block.timestamp).toBeLessThanOrEqual(toTimestamp);
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
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
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(BigInt(transaction.asset.amount)).toBeGreaterThanOrEqual(minAmount);
				expect(BigInt(transaction.asset.amount)).toBeLessThanOrEqual(maxAmount);
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
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
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(BigInt(transaction.asset.amount)).toBeGreaterThanOrEqual(minAmount);
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
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
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(BigInt(transaction.asset.amount)).toBeLessThanOrEqual(maxAmount);
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
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
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
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
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeLessThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Fetch transactions based on multiple request params', () => {
		it('returns transactions with senderAddress and nonce', async () => {
			const response = await getTransactions({
				senderAddress: refTransaction.senderAddress,
				nonce: String(Number(refTransaction.nonce)),
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.senderaddress).toBe(refTransaction.senderAddress);
				expect(transaction.id).toBe(refTransaction.id);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns invalid params response with senderAddress and nonce (incorrect data type)', async () => {
			const response = await getTransactions({
				senderAddress: refTransaction.senderAddress,
				nonce: Number(refTransaction.nonce) - 1,
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('returns invalid params response with unsupported params', async () => {
			const response = await getTransactions({
				address: refTransaction.senderAddress,
				nonce: String(Number(refTransaction.nonce)),
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('returns empty response when queried with transactionID and non-zero offset', async () => {
			const response = await getTransactions({ transactionID: refTransaction.id, offset: 1 });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('returns transaction when queried with transactionID and blockID', async () => {
			const response = await getTransactions({
				transactionID: refTransaction.id,
				blockID: refTransaction.block.id,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.id).toBe(refTransaction.id);
				expect(transaction.block.id).toBe(refTransaction.block.id);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns transaction when queried with transactionID and height', async () => {
			const response = await getTransactions({
				transactionID: refTransaction.id,
				height: String(refTransaction.block.height),
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.id).toBe(refTransaction.id);
				expect(transaction.height).toBe(refTransaction.block.height);
			});
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Transactions ordered by index', () => {
		it('returns 10 transactions ordered by index descending', async () => {
			const response = await getTransactions({ order: 'index:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxIndex = prevTx.index;
					expect(prevTxIndex).toBeGreaterThanOrEqual(transaction.index);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns 10 transactions ordered by index ascending', async () => {
			const response = await getTransactions({ order: 'index:asc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = result.data[i];
					const prevTxIndex = prevTx.index;
					expect(prevTxIndex).toBeLessThanOrEqual(transaction.index);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});
	});
});
