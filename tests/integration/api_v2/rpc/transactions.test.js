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
const { request, closeAll } = require('../../../helpers/socketIoRpcRequest');

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
const requestTransactions = async params => request(wsRpcUrl, 'get.transactions', params);

describe('Method get.transactions', () => {
	let refTransaction;
	beforeAll(async () => {
		let offset = -1;
		do {
			offset++;

			// eslint-disable-next-line no-await-in-loop
			const response2 = await requestTransactions({ limit: 1, offset });
			[refTransaction] = response2.result.data;
		} while (!refTransaction.asset.recipient);
	});

	describe('is able to retrieve transaction using transaction ID', () => {
		it('known transaction id -> ok', async () => {
			const response = await requestTransactions({ transactionId: refTransaction.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeArrayOfSize(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchemaVersion5, { id: refTransaction.id }));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty transaction id -> empty response', async () => {
			const response = await requestTransactions({ transactionId: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using block ID', () => {
		it('known block -> ok', async () => {
			const response = await requestTransactions({ blockId: refTransaction.block.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction).toMap(transactionSchemaVersion5));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty block ->  empty response', async () => {
			const response = await requestTransactions({ blockId: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using moduleAssets', () => {
		it('known transaction moduleAssetId -> ok', async () => {
			const response = await requestTransactions({ moduleAssetId: refTransaction.moduleAssetId });
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
			const response = await requestTransactions({
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
			const response = await requestTransactions({ moduleAssetId: '999' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('empty transaction moduleAsset -> empty response', async () => {
			const response = await requestTransactions({ moduleAssetId: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using sender attributes', () => {
		it('known sender address -> ok', async () => {
			const response = await requestTransactions({ senderAddress: refTransaction.sender.address });
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
			const response = await requestTransactions({ senderAddress: 'lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj' });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retrieve list of transactions using recipient attributes', () => {
		it('known recipient address -> ok', async () => {
			const response = await requestTransactions({
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
			const response = await requestTransactions({ recipientAddress: 'lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj' });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retrieve list of transactions by address', () => {
		it('known address -> ok', async () => {
			const response = await requestTransactions({ address: refTransaction.sender.address });
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
			const response = await requestTransactions({ address: 'lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj' });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retrieve list of transactions using height', () => {
		it('known height -> ok', async () => {
			const response = await requestTransactions({ height: String(refTransaction.block.height) });
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
			const response = await requestTransactions({ height: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using timestamps', () => {
		it('from to -> ok', async () => {
			const from = moment(refTransaction.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const toTimestamp = refTransaction.block.timestamp;
			const response = await requestTransactions({ timestamp: `${from}:${toTimestamp}` });

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
			const response = await requestTransactions({ timestamp: `${from}:` });

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
			const response = await requestTransactions({ timestamp: `:${toTimestamp}` });

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
			const response = await requestTransactions({ amount: `${minAmount}:${maxAmount}` });

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
			const response = await requestTransactions({ amount: `${minAmount}:` });

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
			const response = await requestTransactions({ amount: `:${maxAmount}` });

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
});

afterAll(() => { closeAll(); });
