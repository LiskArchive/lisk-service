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
import { TRANSACTION_EXECUTION_STATUSES } from '../../../schemas/api_v3/constants/transactions';

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
	pendingTransactionSchema,
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
		it('should return list of transactions', async () => {
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

		it(`should return list of transactions when called with executionStatus=${TRANSACTION_EXECUTION_STATUSES.join(',')}`, async () => {
			const response = await getTransactions({ executionStatus: TRANSACTION_EXECUTION_STATUSES.join(',') });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((transaction) => {
				if (transaction.executionStatus === 'pending') {
					expect(transaction).toMap(pendingTransactionSchema);
				} else {
					expect(transaction).toMap(transactionSchema);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('is able to retrieve transaction using transactionID', () => {
		it('should return transactions when called with known transactionID', async () => {
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

		it('should return empty response when called with empty transactionID', async () => {
			const response = await getTransactions({ transactionID: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using blockID', () => {
		it('should return transactions when called with known blockID', async () => {
			const response = await getTransactions({ blockID: refTransaction.block.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction).toMap(transactionSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('should return empty response when called with empty blockID', async () => {
			const response = await getTransactions({ blockID: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using moduleCommand', () => {
		it('should return transactions when called with known transaction moduleCommand', async () => {
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

		it('should return invalid params when called with invalid transaction moduleCommand', async () => {
			const response = await getTransactions({ moduleCommand: '999' });
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return empty response when called with empty transaction moduleCommand', async () => {
			const response = await getTransactions({ moduleCommand: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using senderAddress', () => {
		it('should return transactions when called with known senderAddress', async () => {
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

		it('should return empty response when called with empty senderAddress', async () => {
			const response = await getTransactions({ senderAddress: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('should return invalid params when called with invalid senderAddress', async () => {
			const response = await getTransactions({ senderAddress: 'lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj' });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retrieve list of transactions using recipientAddress', () => {
		it('should return transactions when called with known recipientAddress', async () => {
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

		it('should return empty response when called with empty recipientAddress', async () => {
			const response = await getTransactions({ recipientAddress: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('should return invalid params when called with invalid recipientAddress', async () => {
			const response = await getTransactions({ recipientAddress: 'lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj' });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retrieve list of transactions by address', () => {
		it('should return transactions when called with known address', async () => {
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

		it('should return invalid params when called with invalid address', async () => {
			const response = await getTransactions({ address: 'lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj' });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retrieve list of transactions using height', () => {
		it('should return transactions when called with known height', async () => {
			const response = await getTransactions({ height: String(refTransaction.block.height) });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.block.height).toEqual(refTransaction.block.height);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('should return empty response when called with empty height', async () => {
			const response = await getTransactions({ height: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('should return transactions when called with min...max height', async () => {
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

		it('should return transactions when called with min... height', async () => {
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

		it('should return transactions when called with ...max height', async () => {
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

		it('should return empty response when called with max...min height', async () => {
			const minHeight = refTransaction.block.height;
			const maxHeight = refTransaction.block.height + 100;
			const response = await getTransactions({ height: `${maxHeight}:${minHeight}` });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using timestamps', () => {
		it('should return transactions when called with from to timestamps', async () => {
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

		it('should return transactions when called with fromTimestamp', async () => {
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

		it('should return transactions when called with toTimestamp', async () => {
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

	describe('Transactions sorted by timestamp', () => {
		it('should return 10 transactions sorted by timestamp descending when called with sort=timestamp:desc', async () => {
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

		it('should return 10 transactions sorted by timestamp ascending when called with sort=timestamp:asc', async () => {
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
		it('should return transactions when called with senderAddress and nonce', async () => {
			const response = await getTransactions({
				senderAddress: refTransaction.sender.address,
				nonce: String(Number(refTransaction.nonce)),
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.sender.address).toBe(refTransaction.sender.address);
				expect(transaction.id).toBe(refTransaction.id);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('should return invalid params response when called with senderAddress and nonce (incorrect data type)', async () => {
			const response = await getTransactions({
				senderAddress: refTransaction.senderAddress,
				nonce: Number(refTransaction.nonce) - 1,
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return invalid params response when called with unsupported params', async () => {
			const response = await getTransactions({
				address: refTransaction.senderAddress,
				nonce: String(Number(refTransaction.nonce)),
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return empty response when called with transactionID and non-zero offset', async () => {
			const response = await getTransactions({ transactionID: refTransaction.id, offset: 1 });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('should return transactions when called with transactionID and blockID', async () => {
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

		it('should return transactions when called with transactionID and height', async () => {
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
				expect(transaction.block.height).toBe(refTransaction.block.height);
			});
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Transactions ordered by index', () => {
		it('should return 10 transactions ordered by index descending when called with order=index:desc', async () => {
			const order = 'index:desc';
			const response = await getTransactions({ order });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = result.data[i - 1];
					if (transaction.block.height === prevTx.block.height) {
						if (order.endsWith('asc')) {
							expect(prevTx.index).toBe(transaction.index - 1);
						} else {
							expect(prevTx.index).toBe(transaction.index + 1);
						}
					}
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('should return 10 transactions ordered by index ascending when called with order=index:asc', async () => {
			const order = 'index:asc';
			const response = await getTransactions({ order });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = result.data[i - 1];
					if (transaction.block.height === prevTx.block.height) {
						if (order.endsWith('asc')) {
							expect(prevTx.index).toBe(transaction.index - 1);
						} else {
							expect(prevTx.index).toBe(transaction.index + 1);
						}
					}
				}
			});
			expect(result.meta).toMap(metaSchema);
		});
	});
});
