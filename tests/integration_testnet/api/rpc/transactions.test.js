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
import moment from 'moment';

const config = require('../../config');
const { request } = require('../../helpers/socketIoRpcRequest');

const {
	resultEnvelopeSchema,
	emptyResultEnvelopeSchema,
	emptyResponseSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../schemas/rpcGenerics.schema');

const {
	transactionSchema,
} = require('../../schemas/transaction.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v1`;
const requestTransactions = async params => request(wsRpcUrl, 'get.transactions', params);

describe('Method get.transactions', () => {
	let refDelegate;
	let refTransaction;
	beforeAll(async () => {
		const response1 = await request(wsRpcUrl, 'get.delegates', { limit: 1 });
		[refDelegate] = response1.result.data;

		const response2 = await requestTransactions({ limit: 1 });
		[refTransaction] = response2.result.data;
	});

	describe('is able to retrieve list of transactions by address', () => {
		it('known address -> ok', async () => {
			const response = await requestTransactions({ address: refDelegate.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data).toBeArrayOfSize(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction).toMap(transactionSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('invalid address -> empty response', async () => {
			const response = await requestTransactions({ id: '000000000L' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using sender attributes', () => {
		it('known sender address -> ok', async () => {
			const response = await requestTransactions({ sender: refDelegate.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data).toBeArrayOfSize(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchema, { sender: refDelegate.id }));
			expect(result.meta).toMap(metaSchema);
		});

		it('invalid sender address -> empty response', async () => {
			const response = await requestTransactions({ sender: 'address:000000000L' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using recipient attributes', () => {
		it('known recipient address -> ok', async () => {
			const response = await requestTransactions({ recipient: refDelegate.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data).toBeArrayOfSize(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchema, { recipient: refDelegate.id }));
			expect(result.meta).toMap(metaSchema);
		});

		it('invalid recipient address -> empty response', async () => {
			const response = await requestTransactions({ recipient: '000000000L' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using type', () => {
		it('known transaction type -> ok', async () => {
			const response = await requestTransactions({ type: refTransaction.type });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data).toBeArrayOfSize(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchema, { type: refTransaction.type }));
			expect(result.meta).toMap(metaSchema);
		});

		it('invalid transaction type -> empty response', async () => {
			const response = await requestTransactions({ type: '999' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('empty transaction type -> invalid params', async () => {
			const response = await requestTransactions({ type: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using block ID', () => {
		it('known block -> ok', async () => {
			const response = await requestTransactions({ block: refTransaction.blockId });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchema, { blockId: refTransaction.blockId }));
			expect(result.meta).toMap(metaSchema);
		});

		it('invalid block -> empty response', async () => {
			const response = await requestTransactions({ block: '1000000000000000000000000' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('empty block ->  empty response', async () => {
			const response = await requestTransactions({ block: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using height', () => {
		it('known height -> ok', async () => {
			const response = await requestTransactions({ height: String(refTransaction.height) });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchema, { height: refTransaction.height }));
			expect(result.meta).toMap(metaSchema);
		});

		it('invalid height -> empty response', async () => {
			const response = await requestTransactions({ height: '1000000000000000000000000' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
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
			const from = moment(refTransaction.timestamp).subtract(1, 'day').unix() * 10 ** 3;
			const toTimestamp = refTransaction.timestamp;
			const response = await requestTransactions({ from: String(from), to: String(toTimestamp) });

			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => {
				expect(transaction).toMap(transactionSchema);
				expect(transaction.timestamp).toBeGreaterThanOrEqual(from);
				expect(transaction.timestamp).toBeLessThanOrEqual(toTimestamp);
			});
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('is able to retrieve transaction using transaction ID', () => {
		it('known transaction id -> ok', async () => {
			const response = await requestTransactions({ id: refTransaction.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeArrayOfSize(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction)
				.toMap(transactionSchema, { id: refTransaction.id }));
			expect(result.meta).toMap(metaSchema);
		});

		// TODO: current response => {}
		it('long transaction id -> empty response', async () => {
			const response = await requestTransactions({ id: '412875216073141752800000' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('invalid transaction id -> empty response', async () => {
			const response = await requestTransactions({ id: '41287' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('empty transaction id -> empty response', async () => {
			const response = await requestTransactions({ id: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});
});
