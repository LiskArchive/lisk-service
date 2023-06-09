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
const { resolveModuleCommands } = require('../../../shared/constants');
const { metadata } = require('../../constants/metadata');

describe('Test resolveModuleCommands method', () => {
	it('should return list of moduleCommands when called with valid system metadata', async () => {
		const result = await resolveModuleCommands(metadata.modules);
		const expectedResponse = ['auth:registerMultisignature'];
		expect(result).toBeInstanceOf(Array);
		expect(result).toEqual(expectedResponse);
	});

	it('should throw error when called with null', async () => {
		expect(async () => resolveModuleCommands(null)).rejects.toThrow(TypeError);
	});

	it('should throw error when called with undefined', async () => {
		expect(async () => resolveModuleCommands(undefined)).rejects.toThrow(TypeError);
	});
});
