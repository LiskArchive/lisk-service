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
import accounts from './constants/accounts';
import config from '../../config';

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;
const endpoint = `${baseUrlV1}/accounts`;
const accountEndpoint = `${baseUrlV1}/account`;

const accountSchema = {
	address: 'string',
	balance: 'string',
	publicKey: 'string',
	secondPublicKey: 'string',
	transactionCount: 'object',
	knowledge: 'object',
};

const topAccountSchema = {
	address: 'string',
	publicKey: 'string',
	balance: 'string',
	secondPublicKey: 'string',
	transactionCount: 'object',
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

const delegateSchema = {
	approval: 'string',
	missedBlocks: 'number',
	producedBlocks: 'number',
	productivity: 'string',
	rank: 'number',
	rewards: 'number',
	username: 'string',
	vote: 'string',
};

const votersSchema = {
	address: 'string',
	balance: 'string',
	publicKey: 'string',
};

const votesSchema = {
	address: 'string',
	balance: 'string',
	publicKey: 'string',
	username: 'string',
};

const badRequestSchema = {
	errors: 'array',
	message: 'string',
};

const notFoundSchema = {
	error: 'boolean',
	message: 'string',
};


describe('GET /accounts', () => {
	it('allows to retrieve list of accounts (no params)', async () => {
		const response = await api.get(`${endpoint}`);
		expect(response.data.length).toEqual(10);
		expect(response.data[0]).toMapRequiredSchema({
			...accountSchema,
			address: accounts.genesis.address,
		});
		expect(response.data[0]).toEqual({
			address: '1085993630748340485L',
			balance: '-9999999664752476',
			delegate: {},
			knowledge: {},
			multisignatureAccount: {},
			publicKey: 'c96dec3595ff6041c3bd28b76b8cf75dce8225173d1bd00241624ee89b50f2a8',
			secondPublicKey: '',
			transactionCount: {
				incoming: '0',
				outgoing: '1',
			},
		});
	});

	it('known address -> ok', async () => {
		const response = await api.get(`${endpoint}?address=${accounts.genesis.address}`);
		expect(response.data.length).toEqual(1);
		expect(response.data[0]).toMapRequiredSchema({
			...accountSchema,
			address: accounts.genesis.address,
		});
	});

	it('known address written lowercase -> ok', async () => {
		const response = await api.get(`${endpoint}?address=${accounts.genesis.address.toLowerCase()}`);
		expect(response.data.length).toEqual(1);
		expect(response.data[0]).toMapRequiredSchema({
			...accountSchema,
			address: accounts.genesis.address,
		});
	});

	it('unknown address -> 404', async () => {
		const url = `${endpoint}?address=999999999L`;
		const expectedStatus = 404;
		const response = api.get(url, expectedStatus);
		expect(response).resolves.toMapRequiredSchema(notFoundSchema);
	});

	it('invalid address -> 404', async () => {
		const url = `${endpoint}?address=L`;
		const expectedStatus = 404;
		const response = api.get(url, expectedStatus);
		expect(response).resolves.toMapRequiredSchema(notFoundSchema);
	});

	it('empty address -> 400', () => expect(api.get(`${endpoint}?address=`, 400)).resolves.toMapRequiredSchema(badRequestSchema));

	it('known address by publickey', async () => {
		const url = `${endpoint}?publickey=${accounts.genesis.publicKey}`;
		const expectedStatus = 200;
		const response = await api.get(url, expectedStatus);
		expect(response.data.length).toEqual(1);
		expect(response.data[0]).toMapRequiredSchema({
			...accountSchema,
			publicKey: accounts.genesis.publicKey,
		});
	});

	it('known address by second public key', async () => {
		const url = `${endpoint}?secpubkey=${accounts['second passphrase account'].secondPublicKey}`;
		const expectedStatus = 200;
		const response = await api.get(url, expectedStatus);
		expect(response.data.length).toEqual(1);
		expect(response.data[0]).toMapRequiredSchema({
			...accountSchema,
			secondPublicKey: accounts['second passphrase account'].secondPublicKey,
		});
	});

	it('invalid publicKey -> 404', async () => {
		const url = `${endpoint}?publickey=invalid_pk`;
		const expectedStatus = 404;
		const response = api.get(url, expectedStatus);
		expect(response).resolves.toMapRequiredSchema(notFoundSchema);
	});

	it('unknown publicKey -> 404', async () => {
		const url = `${endpoint}?publickey=ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff`;
		const expectedStatus = 404;
		const response = api.get(url, expectedStatus);
		expect(response).resolves.toMapRequiredSchema(notFoundSchema);
	});

	it('known delegate by address -> contain delegate data', async () => {
		const response = await api.get(`${endpoint}?address=${accounts.delegate.address}`);
		expect(response.data.length).toEqual(1);
		expect(response.data[0].delegate).toMapRequiredSchema({
			...delegateSchema,
		});
	});

	it('known delegate by name -> contain delegate data', async () => {
		const response = await api.get(`${endpoint}?username=${accounts.delegate.username}`);
		expect(response.data.length).toEqual(1);
		expect(response.data[0]).toMapRequiredSchema({
			address: accounts.delegate.address,
		});
		expect(response.data[0].delegate).toMapRequiredSchema({
			...delegateSchema,
		});
	});

	it('empty publicKey -> 400', async () => {
		const url = `${endpoint}?publickey=`;
		const expectedStatus = 400;
		const response = api.get(url, expectedStatus);
		expect(response).resolves.toMapRequiredSchema(badRequestSchema);
	});
});

describe('GET /accounts/top', () => {
	it('returns 100 accounts sorted by balance descending when limit set to 100', async () => {
		const response = await api.get(`${endpoint}/top?limit=100`);
		expect(response.data).toBeArrayOfSize(100);
		expect(response.data[0]).toMapRequiredSchema(topAccountSchema);
		expect(response.data[0]).toEqual({
			address: '16313739661670634666L',
			balance: '9967545010836600',
			delegate: {},
			knowledge: {},
			multisignatureAccount: {},
			publicKey: 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
			secondPublicKey: '',
			transactionCount: {
				incoming: '2',
				outgoing: '1329',
			},
		});
	});

	it('returns BAD_REQUEST (400) when limit=0', async () => {
		const response = await api.get(`${endpoint}/top?limit=0`, 400);
		expect(response).toMapRequiredSchema(badRequestSchema);
	});

	it('returns BAD_REQUEST (400) when given empty limit', async () => {
		const response = await api.get(`${endpoint}/top?limit=`, 400);
		expect(response).toMapRequiredSchema(badRequestSchema);
	});
});

describe('GET /account/{address}', () => {
	it('existing account by address -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/${accounts.genesis.address}`);
		expect(response.data.length).toEqual(1);
		expect(response.data[0]).toMapRequiredSchema(accountSchema);
	});

	it('existing account by username -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/${accounts.delegate.username}`);
		expect(response.data.length).toEqual(1);
		expect(response.data[0]).toMapRequiredSchema(accountSchema);
	});

	it('existing account by public key -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/${accounts.delegate.publicKey}`);
		expect(response.data.length).toEqual(1);
		expect(response.data[0]).toMapRequiredSchema(accountSchema);
	});

	it('existing account by address with address: -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/address:${accounts.genesis.address}`);
		expect(response.data.length).toEqual(1);
		expect(response.data[0]).toMapRequiredSchema(accountSchema);
	});

	it('existing account by username with username: -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/username:${accounts.delegate.username}`);
		expect(response.data.length).toEqual(1);
		expect(response.data[0]).toMapRequiredSchema(accountSchema);
	});

	it('existing account by public key with publickey: -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/publickey:${accounts.delegate.publicKey}`);
		expect(response.data.length).toEqual(1);
		expect(response.data[0]).toMapRequiredSchema(accountSchema);
	});

	it('existing account by username with wrong param: -> ok', async () => {
		const url = `${accountEndpoint}/address:${accounts.delegate.username}`;
		const expectedStatus = 404;
		const response = api.get(url, expectedStatus);
		expect(response).resolves.toMapRequiredSchema(notFoundSchema);
	});

	it('wrong address -> 404', async () => {
		const url = `${accountEndpoint}/999999999L`;
		const expectedStatus = 404;
		const response = api.get(url, expectedStatus);
		expect(response).resolves.toMapRequiredSchema(notFoundSchema);
	});

	it('existing known account by address -> ok with knowledge', async () => {
		const address = '18234943547133247982L';
		const response = await api.get(`${accountEndpoint}/${address}`);
		expect(response.data.length).toEqual(1);
		expect(response.data[0]).toMapRequiredSchema(accountSchema);
		expect(response.data[0].knowledge).toEqual({
			owner: 'Explorer Account',
			description: 'Known addresses test',
		});
	});
});

describe('GET /account/{address}/transactions', () => {
	it('existing account -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/${accounts.genesis.address}/transactions`);
		expect(response.data[0]).toMapRequiredSchema(transactionSchema);
	});

	it('existing username -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/${accounts.delegate.username}/transactions`);
		expect(response.data[0]).toMapRequiredSchema(transactionSchema);
	});

	it('existing public key -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/${accounts.delegate.publicKey}/transactions`);
		expect(response.data[0]).toMapRequiredSchema(transactionSchema);
	});

	it('existing account with address: -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/address:${accounts.genesis.address}/transactions`);
		expect(response.data[0]).toMapRequiredSchema(transactionSchema);
	});

	it('existing username with username: -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/username:${accounts.delegate.username}/transactions`);
		expect(response.data[0]).toMapRequiredSchema(transactionSchema);
	});

	it('existing public key with publickey: -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/publickey:${accounts.delegate.publicKey}/transactions`);
		expect(response.data[0]).toMapRequiredSchema(transactionSchema);
	});

	it('wrong address -> 404', async () => {
		const url = `${accountEndpoint}/999999999L/transactions`;
		const expectedStatus = 404;
		const response = api.get(url, expectedStatus);
		expect(response).resolves.toMapRequiredSchema(notFoundSchema);
	});

	it('address with time range returns transactions within set timestamps', async () => {
		const address = '14895491440237132212L';
		const from = 1497779831;
		const to = 1497779835;
		const response = await api.get(`${accountEndpoint}/${address}/transactions?from=${from}&to=${to}&limit=100`);

		response.data.forEach(transaction => {
			expect(transaction.timestamp).toBeGreaterThanOrEqual(from);
			expect(transaction.timestamp).toBeLessThanOrEqual(to);
		});
	});
});

describe('GET /account/{address}/votes', () => {
	it('existing account -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/16313739661670634666L/votes`);
		expect(response.data[0]).toMapRequiredSchema(votesSchema);
	});

	it('existing user name -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/gottavoteemall/votes`);
		expect(response.data[0]).toMapRequiredSchema(votesSchema);
	});

	it('existing public key -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/d258627878a9b360fe4934218d2415d66b1ed2ef63ce097280bf02189a91468d/votes`);
		expect(response.data[0]).toMapRequiredSchema(votesSchema);
	});

	it('existing account with address: -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/address:16313739661670634666L/votes`);
		expect(response.data[0]).toMapRequiredSchema(votesSchema);
	});

	it('existing user name with username: -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/username:gottavoteemall/votes`);
		expect(response.data[0]).toMapRequiredSchema(votesSchema);
	});

	it('existing public key with publickey: -> ok', async () => {
		const response = await api.get(`${accountEndpoint}/publickey:d258627878a9b360fe4934218d2415d66b1ed2ef63ce097280bf02189a91468d/votes`);
		expect(response.data[0]).toMapRequiredSchema(votesSchema);
	});

	it('wrong address -> 404', async () => {
		const url = `${accountEndpoint}/999999999L/votes`;
		const expectedStatus = 404;
		const response = api.get(url, expectedStatus);
		expect(response).resolves.toMapRequiredSchema(notFoundSchema);
	});
});

describe('GET /account/{address}/voters', () => {
	it('matches specific schema when requested existing account by account ID', async () => {
		const response = await api.get(`${accountEndpoint}/2581762640681118072L/voters`);
		expect(response.data[0]).toMapRequiredSchema(votersSchema);
	});

	it('matches specific data when requested existing account by account ID', async () => {
		const response = await api.get(`${accountEndpoint}/2581762640681118072L/voters`);
		expect(response.data).toEqual([
			{
				address: '16313739661670634666L',
				balance: '9967545010836600',
				publicKey: 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
			},
			{
				address: '4401082358022424760L',
				balance: '997100000000',
				publicKey: 'd258627878a9b360fe4934218d2415d66b1ed2ef63ce097280bf02189a91468d',
			},
		]);
	});

	it('matches specific schema when requested existing account by username', async () => {
		const response = await api.get(`${accountEndpoint}/genesis_14/voters`);
		expect(response.data[0]).toMapRequiredSchema(votersSchema);
	});

	it('matches specific schema when requested existing account by public key', async () => {
		const response = await api.get(`${accountEndpoint}/1af35b29ca515ff5b805a5e3a0ab8c518915b780d5988e76b0672a71b5a3be02/voters`);
		expect(response.data[0]).toMapRequiredSchema(votersSchema);
	});

	it('matches specific schema when requested existing account by account ID (explicit)', async () => {
		const response = await api.get(`${accountEndpoint}/address:2581762640681118072L/voters`);
		expect(response.data[0]).toMapRequiredSchema(votersSchema);
	});

	it('matches specific schema when requested existing account by username (explicit)', async () => {
		const response = await api.get(`${accountEndpoint}/username:genesis_14/voters`);
		expect(response.data[0]).toMapRequiredSchema(votersSchema);
	});

	it('matches specific schema when requested existing account by publickey (explicit)', async () => {
		const response = await api.get(`${accountEndpoint}/publickey:1af35b29ca515ff5b805a5e3a0ab8c518915b780d5988e76b0672a71b5a3be02/voters`);
		expect(response.data[0]).toMapRequiredSchema(votersSchema);
	});

	it('results in NOT_FOUND (404) requested wrong address ', async () => {
		const url = `${accountEndpoint}/999999999L/voters`;
		const expectedStatus = 404;
		const response = api.get(url, expectedStatus);
		expect(response).resolves.toMapRequiredSchema(notFoundSchema);
	});
});
