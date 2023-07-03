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

const accountIndexFilePath = resolve(`${__dirname}/../../../../shared/indexer/accountIndex`);

const mockPublicKey = '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c';
const mockAddress = 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad';

jest.mock('../../../../shared/dataService/index', () => ({
	getAccountsByAddress: jest.fn().mockResolvedValue([]),
}));

describe('updateAccountInfoPk', () => {
	afterEach(() => {
		jest.clearAllMocks();
		jest.resetModules();
	});

	it('should update the account information when upsert is successful', async () => {
		// Mock lisk framework
		jest.mock('lisk-service-framework', () => {
			const actualLiskServiceFramework = jest.requireActual('lisk-service-framework');
			return {
				...actualLiskServiceFramework,
				MySQL: {
					getTableInstance: jest.fn(() => ({
						upsert: jest.fn((data) => {
							expect(data).toEqual({
								publicKey: mockPublicKey,
								address: mockAddress,
							});
						}),
					})),
					KVStore: {
						...actualLiskServiceFramework.MySQL.KVStore,
						configureKeyValueTable: jest.fn(),
						getKeyValueTable: jest.fn(),
					},
				},
				Queue: jest.fn(),
				Logger: jest.fn().mockReturnValue({
					warn: jest.fn(),
				}),
			};
		});

		// Mock the Redis instance
		jest.mock('ioredis', () => jest.fn());

		// Act
		const { updateAccountInfoPk } = require(accountIndexFilePath);
		const job = { data: mockPublicKey };
		await updateAccountInfoPk(job);
	});

	it('should retry and add publicKey to pendingAccountsByPublicKey when upsert fails', async () => {
		// Mock lisk framework
		jest.mock('lisk-service-framework', () => {
			const actualLiskServiceFramework = jest.requireActual('lisk-service-framework');
			return {
				...actualLiskServiceFramework,
				MySQL: {
					getTableInstance: jest.fn(() => ({
						upsert: jest.fn(() => {
							throw Error('error');
						}),
					})),
					KVStore: {
						...actualLiskServiceFramework.MySQL.KVStore,
						configureKeyValueTable: jest.fn(),
						getKeyValueTable: jest.fn(),
					},
				},
				Queue: jest.fn(),
				Logger: jest.fn().mockReturnValue({
					warn: jest.fn((data) => {
						expect(data).toEqual('Failed to update accounts table. Will Retry.');
					}),
				}),
			};
		});

		// Mock the Redis instance
		const Redis = require('ioredis');
		jest.mock('ioredis');
		Redis.mockImplementation(() => ({
			sadd: jest.fn((queueName, publicKey) => {
				expect(queueName).toEqual('pendingAccountsByPublicKey');
				expect(publicKey).toEqual(mockPublicKey);
			}),
		}));

		const { updateAccountInfoPk } = require(accountIndexFilePath);
		const job = { data: mockPublicKey };
		await updateAccountInfoPk(job);
	});

	it('should retry and add publicKey to pendingAccountsByPublicKey when getTableInstance fails', async () => {
		// Mock lisk framework
		jest.mock('lisk-service-framework', () => {
			const actualLiskServiceFramework = jest.requireActual('lisk-service-framework');
			return {
				...actualLiskServiceFramework,
				MySQL: {
					getTableInstance: jest.fn(() => {
						throw Error('error');
					}),
					KVStore: {
						...actualLiskServiceFramework.MySQL.KVStore,
						configureKeyValueTable: jest.fn(),
						getKeyValueTable: jest.fn(),
					},
				},
				Queue: jest.fn(),
				Logger: jest.fn().mockReturnValue({
					warn: jest.fn((data) => {
						expect(data).toEqual('Failed to update accounts table. Will Retry.');
					}),
				}),
			};
		});

		// Mock the Redis instance
		const Redis = require('ioredis');
		jest.mock('ioredis');
		Redis.mockImplementation(() => ({
			sadd: jest.fn((queueName, publicKey) => {
				expect(queueName).toEqual('pendingAccountsByPublicKey');
				expect(publicKey).toEqual(mockPublicKey);
			}),
		}));

		const { updateAccountInfoPk } = require(accountIndexFilePath);
		const job = { data: mockPublicKey };
		await updateAccountInfoPk(job);
	});
});
