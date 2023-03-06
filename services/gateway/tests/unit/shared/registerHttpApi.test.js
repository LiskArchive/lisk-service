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
const { getMethodName, registerApi } = require('../../../shared/registerHttpApi');

const { expectedResponseForRegisterHttpApi } = require('../../constants/registerApi');

describe('Test getMethodName method', () => {
	it('should return POST when called with httpMethod:POST', async () => {
		const response = getMethodName({ httpMethod: 'POST' });
		expect(response).toEqual('POST');
	});

	it('should return GET when called with httpMethod:GET', async () => {
		const response = getMethodName({ httpMethod: 'GET' });
		expect(response).toEqual('GET');
	});

	it('should return GET when called with when empty object', async () => {
		const response = getMethodName({});
		expect(response).toEqual('GET');
	});

	it('should throw error when called with null or undefined', async () => {
		[null, undefined].forEach(
			param => expect(() => getMethodName(param)).toThrow(),
		);
	});
});

describe('Test registerApi method', () => {
	const apiNames = ['http-version3', 'http-exports'];
	const config = {
		whitelist: [],
		aliases: {},
	};
	const registeredModuleNames = ['fee', 'interoperability', 'legacy', 'pos', 'random', 'token', 'validators'];

	it('should return correct api info when called with valid inputs', async () => {
		const response = await registerApi(apiNames, config, registeredModuleNames);
		expect(response).toEqual({
			onBeforeCall: response.onBeforeCall,
			onAfterCall: response.onAfterCall,
			...expectedResponseForRegisterHttpApi,
		});
		expect(typeof response.onBeforeCall).toEqual('function');
		expect(typeof response.onAfterCall).toEqual('function');
	});

	it('should throw error when called with null apiNames or config or registeredModuleNames', async () => {
		expect(() => registerApi(null, config, registeredModuleNames)).toThrow();
		expect(() => registerApi(apiNames, null, registeredModuleNames)).toThrow();
		expect(() => registerApi(apiNames, config, null)).toThrow();
	});

	it('should throw error when called with null inputs', async () => {
		expect(() => registerApi(null, null, null)).toThrow();
	});

	it('should throw error when called with undefined apiNames or config or registeredModuleNames', async () => {
		expect(() => registerApi(undefined, config, registeredModuleNames)).toThrow();
		expect(() => registerApi(apiNames, undefined, registeredModuleNames)).toThrow();
		expect(() => registerApi(apiNames, config, undefined)).toThrow();
	});

	it('should throw error when called with undefined inputs', async () => {
		expect(() => registerApi(undefined, undefined, undefined)).toThrow();
	});
});
