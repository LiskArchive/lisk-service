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

const path = require('path');

const mockConstantsPath = path.resolve(`${__dirname}../../../../shared/constants`);
const mockRequestFilePath = path.resolve(`${__dirname}../../../../shared/utils/request`);

afterEach(() => {
	jest.clearAllMocks();
	jest.resetModules();
});

describe('Test resolveModuleCommands method', () => {
	const { resolveModuleCommands } = require(mockConstantsPath);
	const { metadata } = require('../../constants/metadata');

	it('should return list of moduleCommands when called with valid system metadata', async () => {
		const result = await resolveModuleCommands(metadata.modules);
		expect(result).toBeInstanceOf(Array);
		expect(result).toContain('auth:registerMultisignature');
	});

	it('should throw error when called with null', async () => {
		expect(async () => resolveModuleCommands(null)).rejects.toThrow(TypeError);
	});

	it('should throw error when called with undefined', async () => {
		expect(async () => resolveModuleCommands(undefined)).rejects.toThrow(TypeError);
	});
});

describe('Test getCurrentHeight method', () => {
	it('should return current height when requestConnector works properly', async () => {
		const expectedHeight = 123;
		jest.mock(mockRequestFilePath, () => ({
			requestConnector: async () => ({ height: expectedHeight }),
		}));

		const { getCurrentHeight } = require(mockConstantsPath);
		const result = await getCurrentHeight();
		expect(result).toEqual(expectedHeight);
	});

	it('should return undefined when requestConnector returns empty object', async () => {
		jest.mock(mockRequestFilePath, () => ({
			requestConnector: async () => ({}),
		}));

		const { getCurrentHeight } = require(mockConstantsPath);
		const result = await getCurrentHeight();
		expect(result).toEqual(undefined);
	});

	it('should throw error when requestConnector returns undefined', async () => {
		jest.mock(mockRequestFilePath, () => ({
			requestConnector: async () => undefined,
		}));

		const { getCurrentHeight } = require(mockConstantsPath);
		expect(async () => getCurrentHeight()).rejects.toThrow();
	});

	it('should throw error when requestConnector throws error', async () => {
		jest.mock(mockRequestFilePath, () => ({
			requestConnector: async () => {
				throw new Error('Custom Error');
			},
		}));

		const { getCurrentHeight } = require(mockConstantsPath);
		expect(async () => getCurrentHeight()).rejects.toThrow();
	});
});
