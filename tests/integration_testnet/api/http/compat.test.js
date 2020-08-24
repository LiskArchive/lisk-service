/* eslint-disable quote-props */
/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
import accounts from './constants/accounts';
import block from './constants/blocks';
import transactions from './constants/transactions';
import config from '../../config';

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;
const accountEndpoint = `${baseUrlV1}/account`;
const accountsTopEndpoint = `${baseUrlV1}/accounts/top`;
const blockEndpoint = `${baseUrlV1}/block`;
const { transaction } = transactions;


const accountSchema = {
	address: 'string',
	balance: 'string',
	publicKey: 'string',
	secondPublicKey: 'string',
	transactionCount: 'object',
	knowledge: 'object',
};

const votesSchema = {
	address: 'string',
	balance: 'string',
	publicKey: 'string',
	username: 'string',
};

const blockSchema = {
	height: 'number',
	id: 'string',
	generatorAddress: 'string',
	generatorPublicKey: 'string',
	generatorUsername: 'string',
	numberOfTransactions: 'number',
	reward: 'string',
	timestamp: 'number',
	totalAmount: 'string',
	totalFee: 'string',
	totalForged: 'string',
};

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

const notFoundSchema = badRequestSchema;
const wrongInputParamSchema = badRequestSchema;

describe('Accounts Compatibility API', () => {
	describe('Retrieve top accounts list', () => {
		it('allows to retrieve list of accounts (no params)', async () => {
			const response = await api.get(`${accountsTopEndpoint}`);
			expect(response.data.length).toEqual(10);
			expect(response.data[0]).toMapRequiredSchema(accountSchema);
        });
        
        it('returns 100 accounts sorted by balance descending when limit set to 100', async () => {
			const response = await api.get(`${accountsTopEndpoint}?limit=100`);
			expect(response.data).toBeArrayOfSize(100);
			expect(response.data[0]).toMapRequiredSchema(accountSchema);
		});

		it('returns a list when given empty limit', async () => {
			const response = await api.get(`${accountsTopEndpoint}?limit=`);
			expect(response.data).toBeArrayOfSize(10);
			expect(response.data[0]).toMapRequiredSchema(accountSchema);
		});

		it('returns BAD_REQUEST (400) when pagination limit=0', async () => {
			const response = await api.get(`${accountsTopEndpoint}?limit=0`, 400);
			expect(response).toMapRequiredSchema(badRequestSchema);
		});

		it('returns BAD_REQUEST (400) when pagination limit=101', async () => {
			const response = await api.get(`${accountsTopEndpoint}?limit=101`, 400);
			expect(response).toMapRequiredSchema(badRequestSchema);
        });
        
        it('returns a list when given empty offset', async () => {
			const response = await api.get(`${accountsTopEndpoint}?offset=`);
			expect(response.data).toBeArrayOfSize(10);
			expect(response.data[0]).toMapRequiredSchema(accountSchema);
		});
        
        it('returns a list when given offset=1', async () => {
			const response = await api.get(`${accountsTopEndpoint}?offset=1`);
			expect(response.data).toBeArrayOfSize(10);
			expect(response.data[0]).toMapRequiredSchema(accountSchema);
		});
    });
});

describe('Votes Compatibility API', () => {
    describe('GET /account/{address}/votes', () => {
        it('fetch votes for existing account address', async () => {
			const response = await api.get(`${accountEndpoint}/${accounts.delegate.address}/votes`);
			expect(response.data.length).toBeTruthy();
			expect(response.data[0]).toMapRequiredSchema(votesSchema);
		});

		it('returns NOT_FOUND (404) when no accountId specified', async () => {
			const response = await api.get(`${accountEndpoint}//votes`, 404);
			expect(response).toMapRequiredSchema(notFoundSchema);
		});

		it('returns NOT_FOUND (404) when inexistent accountId specified', async () => {
			const response = await api.get(`${accountEndpoint}/0L/votes`, 404);
			expect(response).toMapRequiredSchema(notFoundSchema);
		});

		it('returns BAD_REQUEST (400) when invalid (too long) accountId specified', async () => {
			const response = await api.get(`${accountEndpoint}/1631373966167063466666666L/votes`, 400);
			expect(response).toMapRequiredSchema(notFoundSchema);
		});
    });
});

describe('Blocks Compatibility API', () => {
    describe('Retrieve block identified by block_id', () => {
        it('fetch block for known blockId', async () => {
			const response = await api.get(`${blockEndpoint}/${block.id}`);
			expect(response.data[0]).toMapRequiredSchema({
				...blockSchema,
				id: block.id,
			});
		});

		it('returns BAD_REQUEST (400) when invalid blockId supplied', async () => {
			const response = await api.get(`${blockEndpoint}/fkfkfkkkffkfkfk10101010101010101010`, 400);
			expect(response).toMapRequiredSchema(badRequestSchema);
		});

		it('returns NOT_FOUND (404) when no blockId specified', async () => {
			const response = await api.get(`${blockEndpoint}/`, 404);
			expect(response).toMapRequiredSchema(notFoundSchema);
		});

		it('returns NOT_FOUND (404) when non-existent blockId specified', async () => {
			const response = await api.get(`${blockEndpoint}/12602944501676077162`, 404);
			expect(response).toMapRequiredSchema(notFoundSchema);
		});

		it('returns BAD_REQUEST (400) with invalid query parameter', async () => {
			const response = await api.get(`${blockEndpoint}/${block.id}?block=12602944501676077162`, 400);
			expect(response).toMapRequiredSchema(wrongInputParamSchema);
		});
    });

    describe('Retrieve transactions contained within an identified block', () => {
        it('fetch block for known blockId', async () => {
			const response = await api.get(`${blockEndpoint}/${transaction.blockId}/transactions`);
			expect(response.data[0]).toMapRequiredSchema({
				...transactionSchema,
				blockId: transaction.blockId,
			});
		});

		it('returns BAD_REQUEST (400) when invalid blockId supplied', async () => {
			const response = await api.get(`${blockEndpoint}/1000000000000000000000000/transactions`, 400);
			expect(response).toMapRequiredSchema(badRequestSchema);
		});

		it('returns NOT_FOUND (404) when no blockId specified', async () => {
			const response = await api.get(`${blockEndpoint}//transactions`, 404);
			expect(response).toMapRequiredSchema(notFoundSchema);
		});
    });
});