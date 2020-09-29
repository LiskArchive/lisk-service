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
import Joi from 'joi';
import to from 'await-to-js';

import { api } from '../../helpers/socketIoRpcRequest';
import { transaction } from './constants/transactions';
import { JSON_RPC } from '../../helpers/errorCodes';
import { goodRequestSchema } from '../../helpers/schemas';

const transactionSchema = Joi.object({
	amount: Joi.string().required(),
	asset: Joi.object().required(),
	blockId: Joi.string().required(),
	confirmations: Joi.number().required(),
	fee: Joi.string().required(),
	height: Joi.number().required(),
	id: Joi.string().required(),
	recipientId: Joi.string().allow('').required(),
	recipientPublicKey: Joi.string().allow('').required(),
	senderId: Joi.string().required(),
	senderPublicKey: Joi.string().required(),
	signature: Joi.string().required(),
	signatures: Joi.array().required(),
	timestamp: Joi.number().required(),
	type: Joi.number().required(),
	senderSecondPublicKey: Joi.string(),
}).required();

const invalidParamsSchema = Joi.object({
	code: Joi.number().required(),
	message: Joi.string().required(),
}).required();

const requestTransactions = async params => api.getJsonRpcV1('get.transactions', params);

describe('get.transactions', () => {
	it('known transaction id -> ok', async () => {
		const id = '3634383815892709956';
		const response = await requestTransactions({ id });
		expect(response.data[0]).toMap(transactionSchema, { id });
	});

	// To Do: current response => {}
	it('long transaction id -> -32600', async () => {
		const response = await requestTransactions({ id: '412875216073141752800000' });
		expect(response).toEqual({});
	});

	it('invalid transaction id -> empty response', async () => {
		const response = await requestTransactions({ id: '41287' });
		expect(response).toEqual({});
	});

	it('empty transaction id -> invalid params', async () => {
		const [error] = await to(requestTransactions({ id: '' }));
		expect(error).toMap(invalidParamsSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	it('known transaction type -> ok', async () => {
		const response = await requestTransactions({ type: `${transaction.type}` });
		expect(response.data[0]).toMap(transactionSchema, { type: transaction.type });
	});

	it('invalid transaction type -> -32602', async () => {
		const [error] = await to(requestTransactions({ type: '13' }));
		expect(error).toMap(invalidParamsSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	it('empty transaction type -> invalid params', async () => {
		const [error] = await to(requestTransactions({ type: '' }));
		expect(error).toMap(invalidParamsSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	it('known address -> ok', async () => {
		const response = await requestTransactions({ address: transaction.recipientId });
		expect(response.data[0]).toMap(transactionSchema);
	});

	it('invalid address -> empty response', async () => {
		const response = await requestTransactions({ id: '000000000L' });
		expect(response).toEqual({});
	});

	it('known sender address -> ok', async () => {
		const response = await requestTransactions({ sender: transaction.senderId });
		expect(response.data[0]).toMap(transactionSchema, { senderId: transaction.senderId });
	});

	it('invalid sender address -> empty response', async () => {
		const response = await requestTransactions({ sender: '000000000L' });
		expect(response).toEqual({});
	});

	it('known recipient address -> ok', async () => {
		const response = await requestTransactions({ recipient: transaction.recipientId });
		expect(response.data[0])
			.toMap(transactionSchema, { recipientId: transaction.recipientId });
	});

	it('invalid recipient address -> empty response', async () => {
		const response = await requestTransactions({ recipient: '000000000L' });
		expect(response).toEqual({});
	});

	it('known block -> ok', async () => {
		const blockId = '6524861224470851795';
		const response = await requestTransactions({ block: blockId });
		expect(response.data[0]).toMap(transactionSchema, { blockId });
	});

	it('invalid block -> empty response', async () => {
		const response = await requestTransactions({ block: '1000000000000000000000000' });
		expect(response).toEqual({});
	});

	it('empty block -> -32602', async () => {
		const [error] = await to(requestTransactions({ block: '' }));
		expect(error).toMap(invalidParamsSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	it('known height -> ok', async () => {
		const response = await requestTransactions({ height: transaction.height });
		expect(response.data[0]).toMap(transactionSchema, { height: transaction.height });
	});

	it('invalid height -> empty response', async () => {
		const response = await requestTransactions({ height: '1000000000000000000000000' });
		expect(response).toEqual({});
	});

	it('empty height -> -32602', async () => {
		const [error] = await to(requestTransactions({ height: '' }));
		expect(error).toMap(invalidParamsSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

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
