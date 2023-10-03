/*
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
 */

const config = require('../config');
const validConfig = require('./constants/validConfig');
const setup = require('./helper/setup');

const { mockServiceURLSuccessRes, mockServiceURL500Res, mockServiceURLIncorrectRes, mockServiceURLSuccessResWs,
	mockServiceURLIncorrectResWs, mockNodeURLSuccessResWs, mockNodeURLIncorrectResWs, mockImageResolutionResponse,
	mockIncorrectImageResolutionResponse } = require('./constants/serviceURLResponse');

let filesToTest;

jest.mock('axios');
jest.mock('socket.io-client');
jest.mock('@liskhq/lisk-client');

describe('URL Validation tests', () => {
	beforeAll(async () => {
		// Create a temporary directory and some files for testing
		/* eslint-disable max-len */
		await setup.createTestEnvironment();
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(validConfig.nativeTokenConfig));
		filesToTest = setup.getJSONFilesFromNetwork();
		/* eslint-enable max-len */
	});

	beforeEach(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});

	afterAll(async () => {
		// Remove the temporary directory and files created during testing
		await setup.cleanTestEnvironment();
	});

	it('should have validation errors when HTTP service URL API returns an error', async () => {
		jest.mock('../src/utils/request/index', () => ({
			httpRequest: jest.fn().mockRejectedValueOnce('mock error'),
			wsRequest: jest.fn().mockResolvedValueOnce(mockServiceURLSuccessResWs),
			requestInfoFromLiskNodeWSEndpoint: jest.fn().mockResolvedValueOnce(mockNodeURLSuccessResWs),
		}));

		// Test validation
		const { validateURLs } = require('../src/validateURLs');
		const urlErrors = await validateURLs(filesToTest);
		expect(urlErrors.length).toBeGreaterThan(0);

		// Restore axios mock
		jest.resetAllMocks();
	});

	it('should have validation errors when node URL API returns an error', async () => {
		jest.mock('../src/utils/request/index', () => ({
			httpRequest: jest.fn((url, options) => {
				if (options && options.responseType === 'arraybuffer') {
					return mockImageResolutionResponse;
				}
				return mockServiceURLSuccessRes;
			}),
			wsRequest: jest.fn().mockResolvedValueOnce(mockServiceURLSuccessResWs),
			requestInfoFromLiskNodeWSEndpoint: jest.fn().mockRejectedValueOnce('mock error'),
		}));

		// Test validation
		const { validateURLs } = require('../src/validateURLs');
		const urlErrors = await validateURLs(filesToTest);
		expect(urlErrors.length).toBeGreaterThan(0);

		// Restore axios mock
		jest.resetAllMocks();
	});

	it('should have validation errors when ws service URL API returns an error', async () => {
		jest.mock('../src/utils/request/index', () => ({
			httpRequest: jest.fn((url, options) => {
				if (options && options.responseType === 'arraybuffer') {
					return mockImageResolutionResponse;
				}
				return mockServiceURLSuccessRes;
			}),
			wsRequest: jest.fn().mockRejectedValueOnce('mock error'),
			requestInfoFromLiskNodeWSEndpoint: jest.fn().mockResolvedValueOnce(mockNodeURLSuccessResWs),
		}));

		// Test validation
		const { validateURLs } = require('../src/validateURLs');
		const urlErrors = await validateURLs(filesToTest);
		expect(urlErrors.length).toBeGreaterThan(0);

		// Restore axios mock
		jest.resetAllMocks();
	});

	it('should have validation errors when ws service URL API returns an error', async () => {
		// Mock requests
		jest.mock('../src/utils/request/index', () => ({
			httpRequest: jest.fn((url, options) => {
				if (options && options.responseType === 'arraybuffer') {
					return mockImageResolutionResponse;
				}
				return mockServiceURLSuccessRes;
			}),
			wsRequest: jest.fn().mockResolvedValueOnce(mockServiceURLIncorrectResWs),
			requestInfoFromLiskNodeWSEndpoint: jest.fn().mockResolvedValueOnce(mockNodeURLSuccessResWs),
		}));

		// Test validation
		const { validateURLs } = require('../src/validateURLs');
		const urlErrors = await validateURLs(filesToTest);
		expect(urlErrors.length).toBeGreaterThan(0);

		// Restore axios mock
		jest.resetAllMocks();
	});

	it('should have validation errors when HTTP service URL API returns status code other than 200', async () => {
		// Mock requests
		jest.mock('../src/utils/request/index', () => ({
			httpRequest: jest.fn((url, options) => {
				if (options && options.responseType === 'arraybuffer') {
					return mockImageResolutionResponse;
				}
				return mockServiceURL500Res;
			}),
			wsRequest: jest.fn().mockResolvedValueOnce(mockServiceURLSuccessResWs),
			requestInfoFromLiskNodeWSEndpoint: jest.fn().mockResolvedValueOnce(mockNodeURLSuccessResWs),
		}));

		// Test validation
		const { validateURLs } = require('../src/validateURLs');
		const urlErrors = await validateURLs(filesToTest);
		expect(urlErrors.length).toBeGreaterThan(0);

		// Restore axios mock
		jest.resetAllMocks();
	});

	it('should have validation errors when HTTP service URL API returns logo image of incorrect resolution', async () => {
		// Mock requests
		jest.mock('../src/utils/request/index', () => ({
			httpRequest: jest.fn((url, options) => {
				if (options && options.responseType === 'arraybuffer') {
					return mockIncorrectImageResolutionResponse;
				}
				return mockServiceURLSuccessRes;
			}),
			wsRequest: jest.fn().mockResolvedValueOnce(mockServiceURLSuccessResWs),
			requestInfoFromLiskNodeWSEndpoint: jest.fn().mockResolvedValueOnce(mockNodeURLSuccessResWs),
		}));

		// Test validation
		const { validateURLs } = require('../src/validateURLs');
		const urlErrors = await validateURLs(filesToTest);
		expect(urlErrors.length).toBeGreaterThan(0);

		// Restore axios mock
		jest.resetAllMocks();
	});

	it('should not have validation errors when service URL API returns correct chainID', async () => {
		// Mock requests
		jest.mock('../src/utils/request/index', () => ({
			httpRequest: jest.fn((url, options) => {
				if (options && options.responseType === 'arraybuffer') {
					return mockImageResolutionResponse;
				}
				return mockServiceURLSuccessRes;
			}),
			wsRequest: jest.fn().mockResolvedValueOnce(mockServiceURLSuccessResWs),
			requestInfoFromLiskNodeWSEndpoint: jest.fn().mockResolvedValueOnce(mockNodeURLSuccessResWs),
		}));

		// Test validation
		const { validateURLs } = require('../src/validateURLs');
		const urlErrors = await validateURLs(filesToTest);
		expect(urlErrors.length).toBe(0);

		// Restore axios mock
		jest.resetAllMocks();
	});

	it('should have validation errors when HTTP service URL API returns incorrect chain ID', async () => {
		// Mock requests
		jest.mock('../src/utils/request/index', () => ({
			httpRequest: jest.fn((url, options) => {
				if (options && options.responseType === 'arraybuffer') {
					return mockImageResolutionResponse;
				}

				return mockServiceURLIncorrectRes;
			}),
			wsRequest: jest.fn().mockResolvedValueOnce(mockServiceURLSuccessResWs),
			requestInfoFromLiskNodeWSEndpoint: jest.fn().mockResolvedValueOnce(mockNodeURLSuccessResWs),
		}));

		// Test validation
		const { validateURLs } = require('../src/validateURLs');
		const urlErrors = await validateURLs(filesToTest);
		expect(urlErrors.length).toBeGreaterThan(0);

		// Restore axios mock
		jest.resetAllMocks();
	});

	it('should have validation errors when node returns incorrect chain ID', async () => {
		// Mock requests
		jest.mock('../src/utils/request/index', () => ({
			httpRequest: jest.fn((url, options) => {
				if (options && options.responseType === 'arraybuffer') {
					return mockImageResolutionResponse;
				}

				return mockServiceURLSuccessRes;
			}),
			wsRequest: jest.fn().mockResolvedValueOnce(mockServiceURLSuccessResWs),
			requestInfoFromLiskNodeWSEndpoint: jest.fn().mockResolvedValueOnce(mockNodeURLIncorrectResWs),
		}));

		// Test validation
		const { validateURLs } = require('../src/validateURLs');
		const urlErrors = await validateURLs(filesToTest);
		expect(urlErrors.length).toBeGreaterThan(0);

		// Restore axios mock
		jest.resetAllMocks();
	});
});
