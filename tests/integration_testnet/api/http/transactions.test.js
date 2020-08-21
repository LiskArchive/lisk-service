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
import api from '../../helpers/api';
import transactions from './constants/transactions';
import accounts from './constants/accounts';
import config from '../../config';

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;
const endpoint = `${baseUrlV1}/transactions`;
const { transaction } = transactions;

const transactionSchema = {
	amount: 'string',
	asset: 'object',
	blockId: 'string',
	confirmations: 'number',
	fee: 'string',
	height: 'number',
	id: 'string',
	recipientId: 'string',
	recipientPublicKey: 'string',
	senderId: 'string',
	senderPublicKey: 'string',
	signature: 'string',
	signatures: 'array',
	timestamp: 'number',
	type: 'number',
};

const badRequestSchema = {
	error: 'boolean',
	message: 'string',
};

const notFoundSchema = {
	error: 'boolean',
	message: 'string',
};

describe('Transactions API', () => {
	describe('Retrieve transaction lists', () => {
		it('returns list of transactions', async () => {
			const response = await api.get(`${endpoint}`);
			response.data.forEach(element => {
				expect(element).toMapRequiredSchema(transactionSchema);
			});
		});

		it('returns transactions with known transaction type', async () => {
			const response = await api.get(`${endpoint}?type=${transaction.type}`);
			response.data.forEach(element => {
				expect(element).toMapRequiredSchema({
					...transactionSchema,
					type: transaction.type,
				});
			});
		});

		it('invalid transaction type -> 400', async () => {
			const response = await api.get(`${endpoint}?type=-124`, 400);
			expect(response).toMapRequiredSchema(badRequestSchema);
		});

		it('empty transaction type ->  ok', async () => {
			const response = await api.get(`${endpoint}?type=`);
			expect(response.data[0]).toMapRequiredSchema({
				...transactionSchema,
			});
		});
	});

	describe('Retrieve a transaction by transaction ID', () => {
		it(`returns requested transaction when known transaction id=${transaction.id}`, async () => {
			const response = await api.get(`${endpoint}?id=${transaction.id}`);
			expect(response.data[0]).toMapRequiredSchema({
				id: transaction.id,
				...transactionSchema,
			});
		});

		it('long transaction id -> 404', async () => {
			const response = await api.get(`${endpoint}?id=412875216073141752800000`, 404);
			expect(response).toMapRequiredSchema(badRequestSchema);
		});

		it('invalid transaction id -> 404', async () => {
			const response = await api.get(`${endpoint}?id=41287`, 404);
			expect(response).toMapRequiredSchema(notFoundSchema);
		});

		it('empty transaction id -> ok', async () => {
			const response = await api.get(`${endpoint}?block=`);
			expect(response.data[0]).toMapRequiredSchema({
				...transactionSchema,
			});
		});
	});


	describe('Retrieve transaction list by block ID', () => {
		it('known block -> ok', async () => {
			const response = await api.get(`${endpoint}?block=${transaction.blockId}`);
			expect(response.data[0]).toMapRequiredSchema({
				...transactionSchema,
				blockId: transaction.blockId,
			});
		});

		it('invalid block -> 404', async () => {
			const response = await api.get(`${endpoint}?block=1000000000000000000000000'`, 404);
			expect(response).toMapRequiredSchema(badRequestSchema);
		});

		it('empty block -> ok', async () => {
			const response = await api.get(`${endpoint}?block=`);
			expect(response.data[0]).toMapRequiredSchema({
				...transactionSchema,
			});
		});
	});

	describe('Retrieve transaction list by height', () => {
		it('known height -> ok', async () => {
			const response = await api.get(`${endpoint}?height=${transaction.height}`);
			expect(response.data[0]).toMapRequiredSchema({
				...transactionSchema,
				height: transaction.height,
			});
		});

		it('invalid height -> 404', async () => {
			const response = await api.get(`${endpoint}?height=1000000000000000000000000'`, 404);
			expect(response).toMapRequiredSchema(badRequestSchema);
		});

		it('empty height -> ok', async () => {
			const response = await api.get(`${endpoint}?height=`);
			expect(response.data[0]).toMapRequiredSchema({
				...transactionSchema,
			});
		});
	});

	describe('Retrieve transaction list by address', () => {
		// Given test fails during CI phase
		xit('known address -> ok', async () => {
			const response = await api.get(`${endpoint}?address=${transaction.recipientId}`);
			expect(response.data[0]).toMapRequiredSchema({
				...transactionSchema,
			});
		});

		it('invalid address -> 404', async () => {
			const response = await api.get(`${endpoint}?address=000002345`, 404);
			expect(response).toMapRequiredSchema(notFoundSchema);
		});

		it('known sender address -> ok', async () => {
			const response = await api.get(`${endpoint}?sender=${transaction.senderId}`);
			expect(response.data[0]).toMapRequiredSchema({
				...transactionSchema,
				senderId: transaction.senderId,
			});
		});

		it('invalid sender address -> 404', async () => {
			const response = await api.get(`${endpoint}?sender=000002345`, 404);
			expect(response).toMapRequiredSchema(notFoundSchema);
		});

		xit('known recipient address -> ok', async () => {
			const response = await api.get(`${endpoint}?recipient=${transaction.recipientId}`);
			expect(response.data[0]).toMapRequiredSchema({
				...transactionSchema,
				recipientId: transaction.recipientId,
			});
		});

		it('invalid recipient address -> 404', async () => {
			const response = await api.get(`${endpoint}?recipient=000002345`, 404);
			expect(response).toMapRequiredSchema(notFoundSchema);
		});

		it('existing sender public key -> ok', async () => {
			const response = await api.get(`${endpoint}?sender=address:${accounts.delegate.address}`);
			expect(response.data[0]).toMapRequiredSchema({
				...transactionSchema,
				senderPublicKey: accounts.delegate.publicKey,
			});
		});

		it('existing recipient public key -> ok', async () => {
			const response = await api.get(`${endpoint}?recipient=address:${accounts.delegate.address}`);
			expect(response.data[0]).toMapRequiredSchema({
				...transactionSchema,
				recipientPublicKey: accounts.delegate.publicKey,
			});
		});
	});

	describe('Retrieve transaction list by public key', () => {
		it('existing sender public key -> ok', async () => {
			const response = await api.get(`${endpoint}?sender=publickey:${accounts.delegate.publicKey}`);
			expect(response.data[0]).toMapRequiredSchema({
				...transactionSchema,
				senderPublicKey: accounts.delegate.publicKey,
			});
		});

		it('existing recipient public key -> ok', async () => {
			const response = await api.get(`${endpoint}?recipient=publickey:${accounts.delegate.publicKey}`);
			expect(response.data[0]).toMapRequiredSchema({
				...transactionSchema,
				recipientPublicKey: accounts.delegate.publicKey,
			});
		});
	});

	describe('Retrieve transaction list by username', () => {
		it('existing sender username -> ok', async () => {
			const response = await api.get(`${endpoint}?sender=username:${accounts.delegate.delegate.username}`);
			expect(response.data[0]).toMapRequiredSchema({
				...transactionSchema,
				senderPublicKey: accounts.delegate.publicKey,
			});
		});

		it('existing recipient username -> ok', async () => {
			const response = await api.get(`${endpoint}?recipient=username:${accounts.delegate.delegate.username}`);
			expect(response.data[0]).toMapRequiredSchema({
				...transactionSchema,
				recipientPublicKey: accounts.delegate.publicKey,
			});
		});
	});

	xdescribe('Retrieve transaction list by second public key', () => {
	});

	describe('Retrieve transaction list within timestamps', () => {
		it('transactions within set timestamps are returned', async () => {
			const from = 1556181000; // 2019-04-25T08:30:00+00:00
			const to = from + (30 * 60); // +30 mins
			const response = await api.get(`${endpoint}?from=${from}&to=${to}&limit=100`);

			expect(response.data.length).toBe(6);

			response.data.forEach((trx) => {
				expect(trx.timestamp).toBeGreaterThanOrEqual(from);
				expect(trx.timestamp).toBeLessThanOrEqual(to);
			});
		});
	});
});
