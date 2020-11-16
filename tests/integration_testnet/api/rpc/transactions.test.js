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
import config from '../../config';
import request from '../../helpers/socketIoRpcRequest';
import { transaction } from './constants/transactions';
import { block } from './constants/blocks';

const {
	resultEnvelopeSchema,
	emptyResultEnvelopeSchema,
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
} = require('../../schemas/generics.schema');

const {
	transactionSchema,
} = require('../../schemas/transaction.schema');

const { goodRequestSchema } = require('../../helpers/schemas/general');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v1`;

const requestTransactions = async params => request(wsRpcUrl, 'get.transactions', params);

describe('Method get.transactions', () => {
	describe('is able to retrieve list of transactions by address', () => {
		it('known address -> ok', async () => {
			const response = await requestTransactions({ address: transaction.recipientId });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(resultEnvelopeSchema);
		});

		it('invalid address -> empty response', async () => {
			const response = await requestTransactions({ id: '000000000L' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using sender attributes', () => {
		it('known sender address -> ok', async () => {
			const response = await requestTransactions({ sender: `address:${transaction.senderId}` });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(resultEnvelopeSchema);
		});

		it('invalid sender address -> empty response', async () => {
			const response = await requestTransactions({ sender: 'address:000000000L' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using recipient attributes', () => {
		it('known recipient address -> ok', async () => {
			const response = await requestTransactions({ recipient: transaction.recipientId });
			expect(response.result.data[0])
				.toMap(transactionSchema, { recipientId: transaction.recipientId });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(resultEnvelopeSchema);
		});

		it('invalid recipient address -> empty response', async () => {
			const response = await requestTransactions({ recipient: '000000000L' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using type', () => {
		it('known transaction type -> ok', async () => {
			const response = await requestTransactions({ type: `${transaction.type}` });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(resultEnvelopeSchema);
			expect(response.result.data[0]).toMap(transactionSchema, { type: transaction.type });
		});

		it('invalid transaction type -> empty response', async () => {
			const response = await requestTransactions({ type: '13' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(emptyResultEnvelopeSchema);
		});

		it('empty transaction type -> invalid params', async () => {
			const response = await requestTransactions({ type: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using block ID', () => {
		xit('known block -> ok', async () => {
			const response = await requestTransactions({ block: block.id });
			expect(response.result.data[0]).toMap(transactionSchema, { blockId: block.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(resultEnvelopeSchema);
		});

		it('invalid block -> empty response', async () => {
			const response = await requestTransactions({ block: '1000000000000000000000000' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(emptyResultEnvelopeSchema);
		});

		it('empty block ->  empty response', async () => {
			const response = await requestTransactions({ block: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve list of transactions using height', () => {
		xit('known height -> ok', async () => {
			const response = await requestTransactions({ height: transaction.height });
			expect(response.result.data[0]).toMap(transactionSchema, { height: transaction.height });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(resultEnvelopeSchema);
		});

		xit('invalid height -> empty response', async () => {
			const response = await requestTransactions({ height: '1000000000000000000000000' });
			expect(response).toMap(invalidParamsSchema);
		});

		it('empty height -> ', async () => {
			const response = await requestTransactions({ height: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(emptyResultEnvelopeSchema);
		});
	});

	xdescribe('is able to retrieve list of transactions using timestamps', () => {
		it('from to -> ok', async () => {
			const from = 1497856679;
			const toTimestamp = 1554283209;
			const response = await requestTransactions({ from, to: toTimestamp });
			expect(response).toMap(goodRequestSchema);
			expect(response.data.length).toEqual(2);
			response.data.forEach(trx => {
				expect(trx.timestamp).toBeGreaterThanOrEqual(from);
				expect(trx.timestamp).toBeLessThanOrEqual(toTimestamp);
			});
		});
	});

	describe('is able to retrieve transaction using transaction ID', () => {
		it('known transaction id -> ok', async () => {
			const { id } = transaction;
			const response = await requestTransactions({ id });
			expect(response.result.data[0]).toMap(transactionSchema, { id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(resultEnvelopeSchema);
		});

		// To Do: current response => {}
		it('long transaction id -> empty response', async () => {
			const response = await requestTransactions({ id: '412875216073141752800000' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(emptyResultEnvelopeSchema);
		});

		it('invalid transaction id -> empty response', async () => {
			const response = await requestTransactions({ id: '41287' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(emptyResultEnvelopeSchema);
		});

		it('empty transaction id -> empty response', async () => {
			const response = await requestTransactions({ id: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			expect(response.result).toMap(emptyResultEnvelopeSchema);
		});
	});
});
