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

const mockRequestFilePath = resolve(`${__dirname}/../../../../../../shared/utils/request`);
const posConstantsFilePath = resolve(`${__dirname}/../../../../../../shared/dataService/business/pos/constants`);

jest.mock('lisk-service-framework', () => {
	const actual = jest.requireActual('lisk-service-framework');
	return {
		...actual,
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
			trace: jest.fn(),
		})),
		MySQL: {
			getTableInstance: jest.fn(),
		},
	};
});

describe('POS constants', () => {
	afterEach(() => {
		jest.clearAllMocks();
		jest.resetModules();
	});

	it('should fetch and return the PoS constants', async () => {
		// Mock dependencies
		const { requestConnector } = require(mockRequestFilePath);
		jest.mock(mockRequestFilePath, () => ({
			requestConnector: jest.fn(),
		}));

		// Mock the successful response from requestConnector
		const mockConstants = { posTokenID: 'abc123' };
		requestConnector.mockResolvedValue(mockConstants);

		// Call the function
		const { getPosConstants } = require(posConstantsFilePath);
		const result = await getPosConstants();

		// Verify the result
		expect(result).toEqual({ data: mockConstants, meta: {} });
	});

	it('should throw an error if requestConnector fails', async () => {
		// Mock dependencies
		const { requestConnector } = require(mockRequestFilePath);
		jest.mock(mockRequestFilePath);

		// Mock the failed response from requestConnector
		const errorMessage = 'Request failed';
		requestConnector.mockRejectedValue(new Error(errorMessage));

		const { getPosConstants } = require(posConstantsFilePath);

		// Call the function and expect it to throw an error
		await expect(getPosConstants()).rejects.toThrow();
	});
});

describe('getPosTokenID', () => {
	it('should return the posTokenID', async () => {
		// Mock dependencies
		const { requestConnector } = require(mockRequestFilePath);
		jest.mock(mockRequestFilePath, () => ({
			requestConnector: jest.fn(),
		}));

		// Mock the successful response from requestConnector
		const mockConstants = { posTokenID: 'abc123' };
		requestConnector.mockResolvedValueOnce(mockConstants);

		// Call the function
		const { getPosConstants, getPosTokenID } = require(posConstantsFilePath);
		const result = await getPosConstants();

		// Verify the result
		expect(result).toEqual({ data: mockConstants, meta: {} });

		// Call the function
		const posTokenID = await getPosTokenID();

		// Verify the result
		expect(posTokenID).toBe(mockConstants.posTokenID);
	});
});
