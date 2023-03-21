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
const { createApiDocs } = require('../../../shared/generateDocs');
const { createApiDocsExpectedResponse } = require('../../constants/generateDocs');

describe('Test createApiDocs method', () => {
	const registeredModuleNames = ['auth', 'validators'];
	const apiName = 'http-version3';

	it('should return correctly mapped object when called with valid data object and def object', async () => {
		const response = await createApiDocs(apiName, {}, registeredModuleNames);
		expect(response).toEqual(createApiDocsExpectedResponse);
	});

	it('should return overridden keys when called with apiJson having existing keys', async () => {
		const persistentObj = {
			'custom key': 'custom value',
		};
		const apiJson = {
			[Object.keys(createApiDocsExpectedResponse)[0]]: 'some data',
			...persistentObj,
		};
		const response = await createApiDocs(apiName, apiJson, registeredModuleNames);
		expect(response).toEqual({
			...createApiDocsExpectedResponse,
			...persistentObj,
		});
	});

	it('should throw error mapped array when called with null apiName or apiJsonPaths or registeredModuleNames', async () => {
		expect(async () => createApiDocs(null, {}, registeredModuleNames)).rejects.toThrow();
		expect(async () => createApiDocs(apiName, null, registeredModuleNames)).rejects.toThrow();
		expect(async () => createApiDocs(apiName, {}, null)).rejects.toThrow();
		expect(async () => createApiDocs(null, null, null)).rejects.toThrow();
	});

	it('should throw error mapped array when called with undefined apiName or apiJsonPaths or registeredModuleNames', async () => {
		expect(async () => createApiDocs(undefined, {}, registeredModuleNames)).rejects.toThrow();
		expect(() => createApiDocs(apiName, undefined, registeredModuleNames)).rejects.toThrow();
		expect(async () => createApiDocs(apiName, {}, undefined)).rejects.toThrow();
		expect(async () => createApiDocs(undefined, undefined, undefined)).rejects.toThrow();
	});
});
