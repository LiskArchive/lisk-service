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
import config from '../../config';

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;
const endpoint = `${baseUrlV1}/transactions`;
const transactionEndpoint = `${baseUrlV1}/transaction`;
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
	errors: 'array',
	message: 'string',
};

const notFoundSchema = {
	error: 'boolean',
	message: 'string',
};

describe('GET /transactions', () => {
	it('known transaction id -> ok', async () => {
		const response = await api.get(`${endpoint}?id=${transaction.id}`);
		expect(response.data[0]).toMapRequiredSchema({
			...transactionSchema,
			id: transaction.id,
		});
	});

	it('long transaction id -> 400', () => expect(api.get(`${endpoint}?id=412875216073141752800000`, 400)).resolves.toMapRequiredSchema({
		...badRequestSchema,
	}));

	it('invalid transaction id -> 404', () => expect(api.get(`${endpoint}?id=41287`, 404)).resolves.toMapRequiredSchema({
		...notFoundSchema,
	}));

	it('empty transaction id -> 400', () => expect(api.get(`${endpoint}?id=`, 400)).resolves.toMapRequiredSchema({
		...badRequestSchema,
	}));

	it('known transaction type -> ok', async () => {
		const response = await api.get(`${endpoint}?type=${transaction.type}`);
		expect(response.data[0]).toMapRequiredSchema({
			...transactionSchema,
			type: transaction.type,
		});
	});

	it('invalid transaction type -> 400', () => expect(api.get(`${endpoint}?type=13`, 400)).resolves.toMapRequiredSchema({
		...badRequestSchema,
	}));

	it('empty transaction type -> 400', () => expect(api.get(`${endpoint}?type=`, 400)).resolves.toMapRequiredSchema({
		...badRequestSchema,
	}));

	it('known address -> ok', async () => {
		const response = await api.get(`${endpoint}?address=${transaction.recipientId}`);
		expect(response.data[0]).toMapRequiredSchema({
			...transactionSchema,
		});
	});

	it('invalid address -> 404', () => expect(api.get(`${endpoint}?address=000000000L`, 404)).resolves.toMapRequiredSchema({
		...notFoundSchema,
	}));

	it('known sender address -> ok', async () => {
		const response = await api.get(`${endpoint}?sender=${transaction.senderId}`);
		expect(response.data[0]).toMapRequiredSchema({
			...transactionSchema,
			senderId: transaction.senderId,
		});
	});

	it('invalid sender address -> 404', () => expect(api.get(`${endpoint}?sender=000000000L`, 404)).resolves.toMapRequiredSchema({
		...notFoundSchema,
	}));

	it('known recipient address -> ok', async () => {
		const response = await api.get(`${endpoint}?recipient=${transaction.recipientId}`);
		expect(response.data[0]).toMapRequiredSchema({
			...transactionSchema,
			recipientId: transaction.recipientId,
		});
	});

	it('invalid recipient address -> 404', () => expect(api.get(`${endpoint}?recipient=000000000L`, 404)).resolves.toMapRequiredSchema({
		...notFoundSchema,
	}));

	it('known block -> ok', async () => {
		const response = await api.get(`${endpoint}?block=${transaction.blockId}`);
		expect(response.data[0]).toMapRequiredSchema({
			...transactionSchema,
			blockId: transaction.blockId,
		});
	});

	it('invalid block -> 400', () => expect(api.get(`${endpoint}?block=1000000000000000000000000'`, 400)).resolves.toMapRequiredSchema({
		...badRequestSchema,
	}));

	it('empty block -> 400', () => expect(api.get(`${endpoint}?block=`, 400)).resolves.toMapRequiredSchema({
		...badRequestSchema,
	}));

	it('known height -> ok', async () => {
		const response = await api.get(`${endpoint}?height=${transaction.height}`);
		expect(response.data[0]).toMapRequiredSchema({
			...transactionSchema,
			height: transaction.height,
		});
	});

	it('invalid height -> 400', () => expect(api.get(`${endpoint}?height=1000000000000000000000000'`, 400)).resolves.toMapRequiredSchema({
		...badRequestSchema,
	}));

	it('empty height -> 400', () => expect(api.get(`${endpoint}?height=`, 400)).resolves.toMapRequiredSchema({
		...badRequestSchema,
	}));


	it('transactions within set timestamps are returned', async () => {
		const from = 1497779831;
		const to = 1497779835;
		const response = await api.get(`${endpoint}?from=${from}&to=${to}&limit=100`);

		response.data.forEach((trx) => {
			expect(trx.timestamp).toBeGreaterThanOrEqual(from);
			expect(trx.timestamp).toBeLessThanOrEqual(to);
		});
	});
});

describe('GET /transactions/last', () => {
	it('known transaction id -> ok', async () => {
		const response = await api.get(`${endpoint}?id=${transaction.id}`);
		expect(response.data[0]).toMapRequiredSchema({
			...transactionSchema,
			id: transaction.id,
		});
	});
});

describe('GET /transaction/{transaction_id}', () => {
	it('known transaction id -> ok', async () => {
		const response = await api.get(`${transactionEndpoint}/${transaction.id}`);
		expect(response.data[0]).toMapRequiredSchema({
			...transactionSchema,
			id: transaction.id,
		});
	});

	it('incorrect transaction id -> 400', () => expect(api.get(`${transactionEndpoint}/123abc`, 400)).resolves.toMapRequiredSchema({
		...badRequestSchema,
	}));

	it('non-existing transaction id -> 400', () => expect(api.get(`${transactionEndpoint}/123456789`, 404)).resolves.toMapRequiredSchema({
		...notFoundSchema,
	}));
});
