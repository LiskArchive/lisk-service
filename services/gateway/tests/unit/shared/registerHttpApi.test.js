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
const { getMethodName, registerApi, configureApi, getAllAPIs } = require('../../../shared/registerHttpApi');
const { configureAPIPrefix, configureAPIMethods, configureApiResponse,
	configureAPIPrefixWithFalseEtag, configureAPIMethodsWithFalseEtag,
	configureAPIWithFalseEtagResponse, getAllAPIsExpectedResponse } = require('../../constants/registerApi');

const { expectedResponseForRegisterHttpApi } = require('../../constants/registerApi');

describe('Test configureApi method', () => {
	it('should return proper response when called with correct params', async () => {
		const response = configureApi(configureAPIPrefix, configureAPIMethods);
		expect(response).toEqual(configureApiResponse);
	});

	it('should return proper response when called with correct params and etag as false', async () => {
		const response = configureApi(configureAPIPrefixWithFalseEtag,
			configureAPIMethodsWithFalseEtag, false);
		expect(response).toEqual(configureAPIWithFalseEtagResponse);
	});

	it('should return empty response when called with empty params', async () => {
		expect(configureApi('/test', {})).toEqual({ aliases: {}, methodPaths: {}, whitelist: [] });
	});
});

describe('Test getAllAPIs method', () => {
	it('should return proper response when called with correct params', async () => {
		const registeredModuleNames = ['auth', 'validators', 'token'];
		const apiName = 'http-status';
		const response = getAllAPIs(apiName, registeredModuleNames);
		expect(response).toEqual(getAllAPIsExpectedResponse);
	});
});

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

		for (let i = 0; i < response.length; i++) {
			expectedResponseForRegisterHttpApi[i].onBeforeCall = response[i].onBeforeCall;
			expectedResponseForRegisterHttpApi[i].onAfterCall = response[i].onAfterCall;
			expectedResponseForRegisterHttpApi[i].path = response[i].path;

			expect(typeof response[i].onBeforeCall).toEqual('function');
			expect(typeof response[i].onAfterCall).toEqual('function');
		}

		expect(response).toEqual(expectedResponseForRegisterHttpApi);
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
