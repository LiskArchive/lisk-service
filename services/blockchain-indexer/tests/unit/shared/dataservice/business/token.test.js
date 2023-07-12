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
const { mockTokenTopBalancesParams, mockTokenTopBalancesTokenInfos, mockTokenTopBalancesDbSearchResult } = require('../../constants/token');

describe('getTokenTopBalances', () => {
	afterEach(() => {
		jest.clearAllMocks();
		jest.resetModules();
	});

	it('should retrieve token top balances', async () => {
		// Declare constants needed for the tests
		const count = 2;

		// Mock lisk-service-framework
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				CacheRedis: jest.fn(() => ({
					set: jest.fn(),
					get: jest.fn(),
				})),
				cacheLRU: jest.fn(() => ({
					set: jest.fn(),
					get: jest.fn(),
				})),
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
							expect(data).toEqual(mockTokenTopBalancesDbSearchResult);
							return mockTokenTopBalancesTokenInfos;
						}),
						count: jest.fn((data) => {
							expect(data).toEqual(mockTokenTopBalancesDbSearchResult);
							return count;
						}),
					})),
					KVStore: {
						...actual.MySQL.KVStore,
						configureKeyValueTable: jest.fn(),
						getKeyValueTable: jest.fn(),
					},
				},
			};
		});

		// Mock accounts knowledge
		jest.mock(knownAccountsPath);
		const { getAccountKnowledge } = require(knownAccountsPath);
		getAccountKnowledge.mockReturnValueOnce('knowledge123').mockReturnValueOnce('knowledge234');

		// Make a query to getTokenTopBalances function
		const { getTokenTopBalances } = require(tokensPath);
		const result = await getTokenTopBalances(mockTokenTopBalancesParams);

		// Assert the result
		expect(getAccountKnowledge).toHaveBeenCalledWith(mockTokenTopBalancesTokenInfos[0].address);
		expect(getAccountKnowledge).toHaveBeenCalledWith(mockTokenTopBalancesTokenInfos[1].address);

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

	it('should throw an error when an error occurs during the find operation', async () => {
		// Mock lisk-service-framework
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				CacheRedis: jest.fn(() => ({
					set: jest.fn(),
					get: jest.fn(),
				})),
				cacheLRU: jest.fn(() => ({
					set: jest.fn(),
					get: jest.fn(),
				})),
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
						find: jest.fn().mockRejectedValue('Error'),
						count: jest.fn(),
					})),
					KVStore: {
						...actual.MySQL.KVStore,
						configureKeyValueTable: jest.fn(),
						getKeyValueTable: jest.fn(),
					},
				},
			};
		});

		// Mock accounts knowledge
		jest.mock(knownAccountsPath);
		const { getAccountKnowledge } = require(knownAccountsPath);
		getAccountKnowledge.mockReturnValueOnce('knowledge123').mockReturnValueOnce('knowledge234');

		// Make a query to getTokenTopBalances function
		const { getTokenTopBalances } = require(tokensPath);
		await expect(getTokenTopBalances(mockTokenTopBalancesParams)).rejects.toBeTruthy();
	});

	it('should throw an error when an error occurs during the count operation', async () => {
		// Mock lisk-service-framework
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				CacheRedis: jest.fn(() => ({
					set: jest.fn(),
					get: jest.fn(),
				})),
				cacheLRU: jest.fn(() => ({
					set: jest.fn(),
					get: jest.fn(),
				})),
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
						find: jest.fn(),
						count: jest.fn().mockRejectedValue('Error'),
					})),
					KVStore: {
						...actual.MySQL.KVStore,
						configureKeyValueTable: jest.fn(),
						getKeyValueTable: jest.fn(),
					},
				},
			};
		});

		// Mock accounts knowledge
		jest.mock(knownAccountsPath);
		const { getAccountKnowledge } = require(knownAccountsPath);
		getAccountKnowledge.mockReturnValueOnce('knowledge123').mockReturnValueOnce('knowledge234');

		// Make a query to getTokenTopBalances function
		const { getTokenTopBalances } = require(tokensPath);
		await expect(getTokenTopBalances(mockTokenTopBalancesParams)).rejects.toBeTruthy();
	});

	it('should throw an error when the params argument is null', async () => {
		// Mock lisk-service-framework
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				CacheRedis: jest.fn(() => ({
					set: jest.fn(),
					get: jest.fn(),
				})),
				cacheLRU: jest.fn(() => ({
					set: jest.fn(),
					get: jest.fn(),
				})),
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
						find: jest.fn(),
						count: jest.fn(),
					})),
					KVStore: {
						...actual.MySQL.KVStore,
						configureKeyValueTable: jest.fn(),
						getKeyValueTable: jest.fn(),
					},
				},
			};
		});

		// Mock accounts knowledge
		jest.mock(knownAccountsPath);
		const { getAccountKnowledge } = require(knownAccountsPath);
		getAccountKnowledge.mockReturnValueOnce('knowledge123').mockReturnValueOnce('knowledge234');

		// Make a query to getTokenTopBalances function
		const { getTokenTopBalances } = require(tokensPath);
		await expect(getTokenTopBalances(null)).rejects.toBeTruthy();
	});
});
