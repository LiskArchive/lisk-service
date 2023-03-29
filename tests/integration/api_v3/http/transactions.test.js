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
const { api } = require('../../../helpers/api');

const {
	goodRequestSchema,
	badRequestSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	transactionSchema,
} = require('../../../schemas/api_v3/transaction.schema');

const baseAddress = config.SERVICE_ENDPOINT;
const baseUrl = `${baseAddress}/api/v3`;
const endpoint = `${baseUrl}/transactions`;

describe('Transactions API', () => {
	let refTransaction;
	beforeAll(async () => {
		const response = await api.get(`${endpoint}?limit=1&moduleCommand=token:transfer`);
		[refTransaction] = response.data;
	});

	describe('Retrieve transaction lists', () => {
		it('returns list of transactions', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = response.data[i - 1];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns transactions with known moduleCommand', async () => {
			const response = await api.get(`${endpoint}?moduleCommand=${refTransaction.moduleCommand}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction)
					.toMap(transactionSchema, { moduleCommand: refTransaction.moduleCommand });
				if (i > 0) {
					const prevTx = response.data[i - 1];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('empty moduleCommand ->  ok', async () => {
			const response = await api.get(`${endpoint}?moduleCommand=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(transaction => expect(transaction).toMap(transactionSchema));
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve a transaction by transactionID', () => {
		it('returns requested transaction with known transactionID', async () => {
			const response = await api.get(`${endpoint}?transactionID=${refTransaction.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(1);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchema, { id: refTransaction.id });
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('empty transactionID -> ok', async () => {
			const response = await api.get(`${endpoint}?transactionID=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = response.data[i - 1];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('long invalid transactionID -> 400 BAD REQUEST', async () => {
			const response = await api.get(`${endpoint}?transactionID=a0833fb5b5534a0c53c3a766bf356c92df2a28e1730fba85667b24f139f65b35578`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('short invalid transactionID -> 400 BAD REQUEST', async () => {
			const response = await api.get(`${endpoint}?transactionID=41287`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve transaction list by blockID', () => {
		it('known block -> ok', async () => {
			const response = await api.get(`${endpoint}?blockID=${refTransaction.block.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.block.id).toBe(refTransaction.block.id);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('empty blockID -> ok', async () => {
			const response = await api.get(`${endpoint}?blockID=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = response.data[i - 1];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid blockID -> 400 OK', async () => {
			const response = await api.get(`${endpoint}?blockID=1000000000000000000000000'`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve transaction list by height', () => {
		it('known height -> ok', async () => {
			const response = await api.get(`${endpoint}?height=${refTransaction.block.height}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.block.height).toBe(refTransaction.block.height);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('empty height -> ok', async () => {
			const response = await api.get(`${endpoint}?height=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = response.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid height -> 400', async () => {
			const response = await api.get(`${endpoint}?height=1000000000000000000000000'`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve transaction list by senderAddress', () => {
		it('known address -> ok', async () => {
			const response = await api.get(`${endpoint}?senderAddress=${refTransaction.sender.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.sender.address).toEqual(refTransaction.sender.address);
				if (i > 0) {
					const prevTx = response.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('empty senderAddress -> ok', async () => {
			const response = await api.get(`${endpoint}?senderAddress=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = response.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid senderAddress -> 400', async () => {
			const response = await api.get(`${endpoint}?senderAddress=lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve transaction list by recipientAddress', () => {
		it('known address -> ok', async () => {
			const response = await api.get(`${endpoint}?recipientAddress=${refTransaction.params.recipientAddress}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.params.recipientAddress).toEqual(refTransaction.params.recipientAddress);
				if (i > 0) {
					const prevTx = response.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('empty recipientAddress -> ok', async () => {
			const response = await api.get(`${endpoint}?recipientAddress=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = response.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid recipientAddress -> 400', async () => {
			const response = await api.get(`${endpoint}?recipientAddress=lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve transaction list by address', () => {
		it('known address -> ok', async () => {
			const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (transaction.params.recipientAddress) {
					expect([transaction.sender.address, transaction.params.recipientAddress])
						.toContain(refTransaction.sender.address);
				} else {
					expect(transaction.sender.address).toMatch(refTransaction.sender.address);
				}
				if (i > 0) {
					const prevTx = response.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid address -> 400', async () => {
			const response = await api.get(`${endpoint}?address=lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve transaction list within timestamps', () => {
		it('transactions within set timestamps are returned', async () => {
			const from = moment(refTransaction.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const toTimestamp = refTransaction.block.timestamp;
			const response = await api.get(`${endpoint}?timestamp=${from}:${toTimestamp}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.block.timestamp).toBeGreaterThanOrEqual(from);
				expect(transaction.block.timestamp).toBeLessThanOrEqual(toTimestamp);
				if (i > 0) {
					const prevTx = response.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('transactions with half bounded range: fromTimestamp', async () => {
			const from = moment(refTransaction.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const response = await api.get(`${endpoint}?timestamp=${from}:`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.block.timestamp).toBeGreaterThanOrEqual(from);
				if (i > 0) {
					const prevTx = response.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('transactions with half bounded range: toTimestamp', async () => {
			const toTimestamp = refTransaction.block.timestamp;
			const response = await api.get(`${endpoint}?timestamp=:${toTimestamp}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.block.timestamp).toBeLessThanOrEqual(toTimestamp);
				if (i > 0) {
					const prevTx = response.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve transaction list within height range', () => {
		it('transactions within set heights are returned', async () => {
			const minHeight = refTransaction.block.height;
			const maxHeight = refTransaction.block.height + 100;
			const response = await api.get(`${endpoint}?height=${minHeight}:${maxHeight}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.block.height).toBeGreaterThanOrEqual(minHeight);
				expect(transaction.block.height).toBeLessThanOrEqual(maxHeight);
				if (i > 0) {
					const prevTx = response.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('transactions with half bounded range: fromHeight', async () => {
			const minHeight = refTransaction.block.height;
			const response = await api.get(`${endpoint}?height=${minHeight}:`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.block.height).toBeGreaterThanOrEqual(minHeight);
				if (i > 0) {
					const prevTx = response.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('transactions with half bounded range: toHeight', async () => {
			const maxHeight = refTransaction.block.height + 100;
			const response = await api.get(`${endpoint}?height=:${maxHeight}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.block.height).toBeLessThanOrEqual(maxHeight);
				if (i > 0) {
					const prevTx = response.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('transactions with minHeight greater than maxHeight -> BAD_REQUEST', async () => {
			const expectedStatusCode = 400;
			const minHeight = refTransaction.block.height;
			const maxHeight = refTransaction.block.height + 100;
			const response = await api.get(`${endpoint}?height=${maxHeight}:${minHeight}&limit=100`, expectedStatusCode);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Transactions sorted by timestamp', () => {
		it('returns 10 transactions sorted by timestamp descending', async () => {
			const response = await api.get(`${endpoint}?sort=timestamp:desc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = response.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 10 transactions sorted by timestamp ascending', async () => {
			const response = await api.get(`${endpoint}?sort=timestamp:asc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = response.data[i];
					const prevTxTimestamp = prevTx.block.timestamp;
					expect(prevTxTimestamp).toBeLessThanOrEqual(transaction.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Transactions sorted by height', () => {
		it('returns 10 transactions sorted by height descending', async () => {
			const response = await api.get(`${endpoint}?sort=height:desc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = response.data[i];
					const prevTxHeight = prevTx.block.height;
					expect(prevTxHeight).toBeGreaterThanOrEqual(transaction.block.height);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 10 transactions sorted by height ascending', async () => {
			const response = await api.get(`${endpoint}?sort=height:asc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = response.data[i];
					const prevTxHeight = prevTx.block.height;
					expect(prevTxHeight).toBeLessThanOrEqual(transaction.block.height);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Fetch transactions based on multiple request params', () => {
		it('returns transaction with senderAddress and nonce', async () => {
			const response = await api.get(`${endpoint}?senderAddress=${refTransaction.sender.address}&nonce=${Number(refTransaction.nonce)}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(1);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.id).toBe(refTransaction.id);
				expect(transaction.sender.address).toBe(refTransaction.sender.address);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 400 BAD REQUEST with unsupported params', async () => {
			const expectedStatusCode = 400;
			const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}&nonce=${Number(refTransaction.nonce) - 1}`, expectedStatusCode);
			expect(response).toMap(badRequestSchema);
		});

		it('returns 200 OK when queried with transactionID and non-zero offset', async () => {
			const response = await api.get(`${endpoint}?transactionID=${refTransaction.id}&offset=1`);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(0);
			expect(response.meta).toMap(metaSchema);
		});

		it('returns transaction when queried with transactionID and blockID', async () => {
			const response = await api.get(`${endpoint}?transactionID=${refTransaction.id}&blockID=${refTransaction.block.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(1);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.id).toBe(refTransaction.id);
				expect(transaction.block.id).toBe(refTransaction.block.id);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns transaction when queried with transactionID and height', async () => {
			const response = await api.get(`${endpoint}?transactionID=${refTransaction.id}&height=${refTransaction.block.height}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(1);
			response.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.id).toBe(refTransaction.id);
				expect(transaction.block.height).toBe(refTransaction.block.height);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns transactions when queried with limit and offset', async () => {
			try {
				const response = await api.get(`${endpoint}?limit=5&offset=1`);
				expect(response).toMap(goodRequestSchema);
				expect(response.data).toBeInstanceOf(Array);
				expect(response.data.length).toBeGreaterThanOrEqual(1);
				expect(response.data.length).toBeLessThanOrEqual(5);
				response.data.forEach((transaction, i) => {
					expect(transaction).toMap(transactionSchema);
					if (i > 0) {
						const prevTx = response.data[i];
						const prevTxTimestamp = prevTx.block.timestamp;
						expect(prevTxTimestamp).toBeGreaterThanOrEqual(transaction.block.timestamp);
					}
				});
				expect(response.meta).toMap(metaSchema);
			} catch (_) {
				const response = await api.get(`${endpoint}?limit=5&offset=1`);
				expect(response.data).toBeInstanceOf(Array);
				expect(response.data.length).toBe(0);
				expect(response.meta).toMap(metaSchema);
			}
		});
	});

	describe('Transactions ordered by index', () => {
		it('returns 10 transactions ordered by index descending', async () => {
			const order = 'index:desc';
			const response = await api.get(`${endpoint}?order=${order}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = response.data[i - 1];
					if (transaction.block.height === prevTx.block.height) {
						if (order.endsWith('asc')) {
							expect(prevTx.index).toBe(transaction.index - 1);
						} else {
							expect(prevTx.index).toBe(transaction.index + 1);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 10 transactions ordered by index ascending', async () => {
			const order = 'index:asc';
			const response = await api.get(`${endpoint}?order=${order}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((transaction, i) => {
				expect(transaction).toMap(transactionSchema);
				if (i > 0) {
					const prevTx = response.data[i - 1];
					if (transaction.block.height === prevTx.block.height) {
						if (order.endsWith('asc')) {
							expect(prevTx.index).toBe(transaction.index - 1);
						} else {
							expect(prevTx.index).toBe(transaction.index + 1);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});
});
