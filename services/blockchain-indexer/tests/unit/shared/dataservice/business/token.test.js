/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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

/* eslint-disable import/no-dynamic-require */
const { resolve } = require('path');

const knownAccountsPath = resolve(`${__dirname}/../../../../../shared/dataService/knownAccounts`);
const tokensPath = resolve(`${__dirname}/../../../../../shared/dataService/business/token`);

describe('getTokenTopBalances', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should retrieve token top balances', async () => {
		// Declare constants needed for the tests
		const params = {
			tokenID: 'token123',
			search: 'search123',
			limit: 10,
			offset: 0,
		};
		const tokenInfos = [
			{
				address: 'address123',
				publicKey: 'publicKey123',
				name: 'name123',
				balance: '100',
			},
			{
				address: 'address456',
				publicKey: 'publicKey456',
				name: 'name456',
				balance: '200',
			},
		];
		const dbSearchResult = {
			tokenID: 'token123',
			limit: 10,
			offset: 0,
			leftOuterJoin: {
				targetTable: 'accounts',
				joinColumnLeft: 'account_balances.address',
				joinColumnRight: 'accounts.address',
			},
			orSearch: [
				{
					property: 'accounts.name',
					pattern: 'search123',
				},
				{
					property: 'accounts.address',
					pattern: 'search123',
				},
				{
					property: 'accounts.publicKey',
					pattern: 'search123',
				},
			],
		};
		const count = 2;

		// Mock lisk-service-framework
		jest.mock('lisk-service-framework', () => ({
			CacheRedis: jest.fn(() => ({
				set: jest.fn(),
				get: jest.fn(),
			})),
			cacheLRU: jest.fn(),
			Exceptions: {
				NotFoundException: jest.fn(),
			},
			Logger: jest.fn(() => ({
				debug: jest.fn(),
				info: jest.fn(),
				warn: jest.fn(),
			})),
			MySQL: {
				getTableInstance: jest.fn(() => ({
					find: jest.fn((data) => {
						expect(data).toEqual(dbSearchResult);
						return tokenInfos;
					}),
					count: jest.fn((data) => {
						expect(data).toEqual(dbSearchResult);
						return count;
					}),
				})),
			},
		}));

		// Mock accounts knowledge
		jest.mock(knownAccountsPath);
		const { getAccountKnowledge } = require(knownAccountsPath);
		getAccountKnowledge.mockReturnValueOnce('knowledge123').mockReturnValueOnce('knowledge234');

		// Make a query to getTokenTopBalances function
		const { getTokenTopBalances } = require(tokensPath);
		const result = await getTokenTopBalances(params);

		// Assert the result
		expect(getAccountKnowledge).toHaveBeenCalledWith(tokenInfos[0].address);
		expect(getAccountKnowledge).toHaveBeenCalledWith(tokenInfos[1].address);

		expect(result).toEqual({
			data: {
				token123: [
					{
						address: 'address123',
						publicKey: 'publicKey123',
						name: 'name123',
						balance: '100',
						knowledge: 'knowledge123',
					},
					{
						address: 'address456',
						publicKey: 'publicKey456',
						name: 'name456',
						balance: '200',
						knowledge: 'knowledge234',
					},
				],
			},
			meta: {
				count: 2,
				total: 2,
				offset: 0,
			},
		});
	});
});
