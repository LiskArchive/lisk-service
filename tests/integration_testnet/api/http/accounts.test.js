/* eslint-disable quote-props */
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

const badRequestSchema = {
	errors: 'array',
	message: 'string',
};

const notFoundSchema = {
	error: 'boolean',
	message: 'string',
};

describe('Accounts API', () => {
	describe('GET /accounts', () => {
		it('allows to retrieve list of accounts (no params)', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response.data.length).toEqual(10);
			expect(response.data[0]).toMapRequiredSchema({
				...accountSchema,
				address: accounts.genesis.address,
			});
			expect(response.data[0]).toEqual({
				'address': '16009998050678037905L',
				'balance': '-9999989700000000',
				'delegate': {},
				'knowledge': {},
				'multisignatureAccount': {},
				'publicKey': '73ec4adbd8f99f0d46794aeda3c3d86b245bd9d27be2b282cdd38ad21988556b',
				'secondPublicKey': '',
				'transactionCount': {
					'incoming': '3',
					'outgoing': '1',
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

		it('invalid address -> 400', async () => {
			const url = `${endpoint}?address=L`;
			const expectedStatus = 400;
			const response = api.get(url, expectedStatus);
			expect(response).resolves.toMapRequiredSchema(notFoundSchema);
		});

		xit('empty address -> 400', () => expect(api.get(`${endpoint}?address=`, 400)).resolves.toMapRequiredSchema(badRequestSchema));

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

		xit('known address by second public key', async () => {
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
			expect(response.data[0]).toMapRequiredSchema({
				address: accounts.delegate.address,
			});
			expect(response.data[0].delegate).toMapRequiredSchema({
				...delegateSchema,
			});
		});

		it('known delegate by name -> contain delegate data', async () => {
			const response = await api.get(`${endpoint}?username=${accounts.delegate.delegate.username}`);
			expect(response.data.length).toEqual(1);
			expect(response.data[0]).toMapRequiredSchema({
				address: accounts.delegate.address,
			});
			expect(response.data[0].delegate).toMapRequiredSchema({
				...delegateSchema,
			});
		});

		xit('empty publicKey -> 400', async () => {
			const url = `${endpoint}?publickey=`;
			const expectedStatus = 400;
			const response = api.get(url, expectedStatus);
			expect(response).resolves.toMapRequiredSchema(badRequestSchema);
		});
	});

	xdescribe('GET /accounts/top', () => {
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

	xdescribe('GET /accounts', () => {
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
			const address = '13795892230918963229L';
			const response = await api.get(`${endpoint}?address=${address}`);
			expect(response.data.length).toEqual(1);
			expect(response.data[0]).toMapRequiredSchema(accountSchema);
			expect(response.data[0].knowledge).toEqual({
				owner: 'Top Account',
				description: 'from Testnet',
			});
		});
	});
});
