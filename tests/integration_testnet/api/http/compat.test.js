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
const config = require('../../config');
const { api } = require('../../helpers/api');

const {
	goodRequestSchema,
	badRequestSchema,
	notFoundSchema,
	wrongInputParamSchema,
	metaSchema,
} = require('../../schemas/httpGenerics.schema');

const { accountSchema } = require('../../schemas/account.schema');
const { blockSchema } = require('../../schemas/block.schema');
const { transactionSchema } = require('../../schemas/transaction.schema');
const { voteSchema, voteMetaSchema } = require('../../schemas/vote.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;
const accountEndpoint = `${baseUrlV1}/account`;
const accountsTopEndpoint = `${baseUrlV1}/accounts/top`;
const blockEndpoint = `${baseUrlV1}/block`;

describe('Accounts Compatibility API', () => {
	describe('Retrieve top accounts list', () => {
		it('allows to retrieve list of accounts (no params)', async () => {
			const response = await api.get(`${accountsTopEndpoint}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(10);
			response.data.forEach(account => expect(account).toMap(accountSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 100 accounts sorted by balance descending when limit set to 100', async () => {
			const response = await api.get(`${accountsTopEndpoint}?limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(100);
			response.data.forEach(account => expect(account).toMap(accountSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns a list when given empty limit', async () => {
			const response = await api.get(`${accountsTopEndpoint}?limit=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(10);
			response.data.forEach(account => expect(account).toMap(accountSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns BAD_REQUEST (400) when pagination limit=0', async () => {
			const response = await api.get(`${accountsTopEndpoint}?limit=0`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('returns BAD_REQUEST (400) when pagination limit=101', async () => {
			const response = await api.get(`${accountsTopEndpoint}?limit=101`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('returns a list when given empty offset', async () => {
			const response = await api.get(`${accountsTopEndpoint}?offset=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(10);
			response.data.forEach(account => expect(account).toMap(accountSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns a list when given offset=1', async () => {
			const response = await api.get(`${accountsTopEndpoint}?offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(10);
			response.data.forEach(account => expect(account).toMap(accountSchema));
			expect(response.meta).toMap(metaSchema, { offset: 1 });
		});
	});
});

describe('Votes Compatibility API', () => {
	describe('GET /account/{address}/votes', () => {
		let refDelegate;
		beforeAll(async () => {
			[refDelegate] = (await api.get(`${baseUrlV1}/delegates?limit=1`)).data;
		});

		it('fetch votes for existing account address', async () => {
			const response = await api.get(`${accountEndpoint}/${refDelegate.address}/votes`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(10);
			response.data.forEach(account => expect(account).toMap(voteSchema));
			expect(response.meta).toMap(voteMetaSchema);
		});

		it('returns NOT_FOUND (404) when no accountId specified', async () => {
			const response = await api.get(`${accountEndpoint}//votes`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('returns NOT_FOUND (404) when inexistent accountId specified', async () => {
			const response = await api.get(`${accountEndpoint}/0L/votes`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('returns BAD_REQUEST (400) when invalid (too long) accountId specified', async () => {
			const response = await api.get(`${accountEndpoint}/1631373966167063466666666L/votes`, 400);
			expect(response).toMap(notFoundSchema);
		});
	});
});

describe('Blocks Compatibility API', () => {
	describe('Retrieve block identified by block_id', () => {
		let refBlock;
		beforeAll(async () => {
			[refBlock] = (await api.get(`${baseUrlV1}/blocks?limit=1`)).data;
		});

		it('fetch block for known blockId', async () => {
			const response = await api.get(`${blockEndpoint}/${refBlock.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(1);
			response.data.forEach(block => expect(block)
				.toMap(blockSchema, { id: refBlock.id }));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns BAD_REQUEST (400) when invalid blockId supplied', async () => {
			const response = await api.get(`${blockEndpoint}/fkfkfkkkffkfkfk10101010101010101010`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('returns NOT_FOUND (404) when no blockId specified', async () => {
			const response = await api.get(`${blockEndpoint}/`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('returns NOT_FOUND (404) when non-existent blockId specified', async () => {
			const response = await api.get(`${blockEndpoint}/12602944501676077162`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('returns BAD_REQUEST (400) with invalid query parameter', async () => {
			const response = await api.get(`${blockEndpoint}/${refBlock.id}?block=12602944501676077162`, 400);
			expect(response).toMap(wrongInputParamSchema);
		});
	});

	describe('Retrieve transactions contained within an identified block', () => {
		let refTransaction;
		beforeAll(async () => {
			[refTransaction] = (await api.get(`${baseUrlV1}/transactions?limit=1`)).data;
		});

		it('fetch block for known blockId', async () => {
			const response = await api.get(`${blockEndpoint}/${refTransaction.blockId}/transactions`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(block => expect(block)
				.toMap(transactionSchema, { blockId: refTransaction.blockId }));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns BAD_REQUEST (400) when invalid blockId supplied', async () => {
			const response = await api.get(`${blockEndpoint}/1000000000000000000000000/transactions`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('returns NOT_FOUND (404) when no blockId specified', async () => {
			const response = await api.get(`${blockEndpoint}//transactions`, 404);
			expect(response).toMap(notFoundSchema);
		});
	});
});
