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

// All file paths
const transactionsFilePath = resolve(`${__dirname}/../../../../shared/dataService/transactions`);
const mockBusinessFilePath = resolve(`${__dirname}/../../../../shared/dataService/business`);

// Mock KeyValueStore table
jest.mock('lisk-service-framework', () => {
	const actualLiskServiceFramework = jest.requireActual('lisk-service-framework');
	return {
		...actualLiskServiceFramework,
		DB: {
			...actualLiskServiceFramework.DB,
			MySQL: {
				...actualLiskServiceFramework.DB.MySQL,
				KVStore: {
					...actualLiskServiceFramework.KVStore,
					getKeyValueTable: jest.fn(),
				},
			},
		},
		CacheRedis: jest.fn(),
		CacheLRU: jest.fn(),
	};
});

describe('dryRunTransactions', () => {
	afterEach(() => {
		jest.clearAllMocks();
		jest.resetModules();
	});

	it('should return response on successful operation', async () => {
		const mockResponse = { data: { success: true } };

		const business = require(mockBusinessFilePath);
		jest.mock(mockBusinessFilePath, () => ({
			dryRunTransactions: jest.fn().mockResolvedValueOnce(mockResponse),
		}));

		const { dryRunTransactions } = require(transactionsFilePath);
		const response = await dryRunTransactions({});

		expect(response).toEqual(mockResponse);
		expect(business.dryRunTransactions).toHaveBeenCalledWith({});
	});

	it('should return internal server error response on network error', async () => {
		const mockError = new Error('ECONNREFUSED');
		const expectedErrorResponse = {
			data: { error: 'Unable to reach a network node.' },
			status: 'INTERNAL_SERVER_ERROR',
		};

		const business = require(mockBusinessFilePath);
		jest.mock(mockBusinessFilePath, () => ({
			dryRunTransactions: jest.fn(() => {
				throw new Error(mockError);
			}),
		}));

		const { dryRunTransactions } = require(transactionsFilePath); // Update with the correct path
		const response = await dryRunTransactions({});
		expect(response).toEqual(expectedErrorResponse);
		expect(business.dryRunTransactions).toHaveBeenCalledWith({});
	});

	it('should return bad request error response on other error', async () => {
		const mockError = new Error('Some other error');
		const expectedErrorResponse = {
			data: { error: `Failed to dry run transaction: Error: ${mockError.message}` },
			status: 'BAD_REQUEST',
		};

		const business = require(mockBusinessFilePath);
		jest.mock(mockBusinessFilePath, () => ({
			dryRunTransactions: jest.fn(() => {
				throw new Error(mockError);
			}),
		}));

		const { dryRunTransactions } = require(transactionsFilePath); // Update with the correct path
		const response = await dryRunTransactions({});
		expect(response).toEqual(expectedErrorResponse);
		expect(business.dryRunTransactions).toHaveBeenCalledWith({});
	});
});

describe('Test isIncludePendingTransactions method', () => {
	it('should return true when called with pending execution status', async () => {
		const executionStatus = 'pending,successful';
		const { isIncludePendingTransactions } = require(transactionsFilePath);
		const result = isIncludePendingTransactions(executionStatus);
		expect(typeof result).toBe('boolean');
		expect(result).toBe(true);
	});

	it('should return false when called without pending execution status', async () => {
		const executionStatus = 'successful,failed';
		const { isIncludePendingTransactions } = require(transactionsFilePath);
		const result = isIncludePendingTransactions(executionStatus);
		expect(typeof result).toBe('boolean');
		expect(result).toBe(false);
	});

	it('should return false when called with undefined', async () => {
		const { isIncludePendingTransactions } = require(transactionsFilePath);
		const result = isIncludePendingTransactions(undefined);
		expect(typeof result).toBe('boolean');
		expect(result).toBe(false);
	});

	it('should return false when called with null', async () => {
		const { isIncludePendingTransactions } = require(transactionsFilePath);
		const result = isIncludePendingTransactions(null);
		expect(typeof result).toBe('boolean');
		expect(result).toBe(false);
	});
});
