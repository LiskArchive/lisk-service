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
const {
	HTTP: { StatusCodes },
	Exceptions: { ValidationException },
} = require('lisk-service-framework');

const { configureAPIPrefix, configureAPIMethods, configureApiResponse,
	configureAPIPrefixWithFalseEtag, configureAPIMethodsWithFalseEtag,
	configureAPIWithFalseEtagResponse, getAllAPIsExpectedResponse, expectedResponseForRegisterHttpApi } = require('../../constants/registerApi');

describe('Test getAPIConfig method', () => {
	let config;
	let methodPaths;
	let req;
	let res;
	let ctx;
	let route;
	let data;

	beforeEach(() => {
		// Initialize the required variables and objects for each test
		config = {
			whitelist: [],
			aliases: {},
		};
		methodPaths = {};
		req = {
			method: 'GET',
			$alias: {
				path: '/api/users',
			},
			$params: {},
		};
		res = {
			setHeader: jest.fn(),
			writeHead: jest.fn(),
			end: jest.fn(),
		};
		ctx = {
			meta: {},
		};
		route = 'route';
		data = {
			data: {},
			status: 'SUCCESS',
			meta: {
				filename: 'data.csv',
			},
		};
	});

	describe('Test onBeforeCall function of getAPIConfig', () => {
		it('should call sendResponse and throw ValidationException if missing parameters exist', async () => {
			const { validate } = require('../../../shared/paramValidator');
			jest.mock('../../../shared/paramValidator');
			validate.mockReturnValueOnce({
				missing: [['param1', 'param2']],
				unknown: {},
				required: [],
				invalid: [],
				valid: {},
			});

			const { getAPIConfig } = require('../../../shared/registerHttpApi');
			const result = getAPIConfig('/api/users', config, {}, [], methodPaths, 'strong');

			result.onBeforeCall(ctx, route, req, res).catch((e) => {
				expect(e).toBeInstanceOf(ValidationException);
			});
		});

		it('should call sendResponse and throw ValidationException if unknown parameters exist', async () => {
			const { validate } = require('../../../shared/paramValidator');
			jest.mock('../../../shared/paramValidator');
			validate.mockReturnValueOnce({
				missing: [],
				unknown: { param1: true, param2: true },
				required: [],
				invalid: [],
				valid: {},
			});

			const { getAPIConfig } = require('../../../shared/registerHttpApi');
			const result = getAPIConfig('/api/users', config, {}, [], methodPaths, 'strong');

			result.onBeforeCall(ctx, route, req, res).catch((e) => {
				expect(e).toBeInstanceOf(ValidationException);
			});
		});

		it('should call sendResponse and throw ValidationException if invalid parameters exist', async () => {
			const { validate } = require('../../../shared/paramValidator');
			jest.mock('../../../shared/paramValidator');
			validate.mockReturnValueOnce({
				missing: [],
				unknown: {},
				required: [['param1', 'param2']],
				invalid: [],
				valid: {},
			});

			const { getAPIConfig } = require('../../../shared/registerHttpApi');

			const result = getAPIConfig('/api/users', config, {}, [], methodPaths, 'strong');

			result.onBeforeCall(ctx, route, req, res).catch((e) => {
				expect(e).toBeInstanceOf(ValidationException);
			});
		});

		it('should call sendResponse and throw ValidationException if invalid parameters exist', async () => {
			const { validate } = require('../../../shared/paramValidator');
			jest.mock('../../../shared/paramValidator');
			validate.mockReturnValueOnce({
				missing: [],
				unknown: {},
				required: [],
				invalid: [['param1', 'param2']],
				valid: {},
			});

			const { getAPIConfig } = require('../../../shared/registerHttpApi');

			const result = getAPIConfig('/api/users', config, {}, [], methodPaths, 'strong');

			result.onBeforeCall(ctx, route, req, res).catch((e) => {
				expect(e).toBeInstanceOf(ValidationException);
			});
		});

		it('should transform the valid parameters and update req.$params', async () => {
			jest.resetModules();
			const { validate } = require('../../../shared/paramValidator');
			const { transformRequest } = require('../../../shared/apiUtils');

			jest.mock('../../../shared/paramValidator');
			jest.mock('../../../shared/apiUtils');

			validate.mockReturnValueOnce({
				missing: [],
				unknown: {},
				required: [],
				invalid: [],
				valid: { param1: true, param2: true },
			});

			transformRequest.mockReturnValueOnce(
				{ param1: true, param2: true },
			);

			const { getAPIConfig } = require('../../../shared/registerHttpApi');

			const result = getAPIConfig('/api/users', config, {}, [], methodPaths, 'strong');
			await result.onBeforeCall(ctx, route, req, res);

			expect(req.$params).toEqual({ param1: true, param2: true });
		});
	});

	describe('Test onAfterCall function of getAPIConfig', () => {
		it('should set Content-Disposition and Content-Type headers and send CSV data if filename ends with .csv', async () => {
			const { getAPIConfig } = require('../../../shared/registerHttpApi');

			const result = getAPIConfig('/api/users', config, {}, [], methodPaths, 'strong');
			await result.onAfterCall(ctx, route, req, res, data);

			expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="data.csv"');
			expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
			expect(res.end).toHaveBeenCalledWith(data.data);
		});

		it('should set $statusCode based on the data status', async () => {
			// Mock the required modules and functions
			jest.mock('lisk-service-framework');
			jest.mock('../../../../gateway/shared/apiUtils');
			jest.mock('../../../../gateway/shared/paramValidator');

			const { getAPIConfig } = require('../../../shared/registerHttpApi');

			const testData = { data: {}, status: 'NOT_FOUND' };
			const result = getAPIConfig('/api/users', config, {}, [], methodPaths, 'strong');
			await result.onAfterCall(ctx, route, req, res, testData);

			expect(ctx.meta.$statusCode).toBe(StatusCodes.NOT_FOUND);
		});

		it('should return an error object if the data status is not ACCEPTED', async () => {
			const { getAPIConfig } = require('../../../shared/registerHttpApi');

			const testData = { data: { error: 'Invalid parameters' }, status: 'INVALID_PARAMS' };
			const result = getAPIConfig('/api/users', config, {}, [], methodPaths, 'strong');
			const response = await result.onAfterCall(ctx, route, req, res, testData);

			expect(response.error).toBe(true);
			expect(response.message).toBe('Invalid parameters');
		});

		it('should return the transformed response if the data status is ACCEPTED', async () => {
			const { transformResponse } = require('../../../shared/apiUtils');
			jest.mock('../../../../gateway/shared/apiUtils');

			const testData = { data: { id: 1, name: 'John Doe' }, status: 'ACCEPTED' };
			transformResponse.mockReturnValueOnce(testData);

			const { getAPIConfig } = require('../../../shared/registerHttpApi');

			const result = getAPIConfig('/api/users', config, {}, [], methodPaths, 'strong');
			const response = await result.onAfterCall(ctx, route, req, res, testData);

			expect(response).toBe(testData);
		});
	});

	it('should add configPath to the returned object', () => {
		const { getAPIConfig } = require('../../../shared/registerHttpApi');
		const configPath = '/api/users';
		const result = getAPIConfig(configPath, config, {}, [], methodPaths, 'strong');

		expect(result.path).toBe(configPath);
	});

	it('should merge the whitelist arrays', () => {
		const { getAPIConfig } = require('../../../shared/registerHttpApi');
		config.whitelist = ['/api/posts'];
		const whitelist = ['/api/comments', '/api/likes'];
		const result = getAPIConfig('/api/users', config, {}, whitelist, methodPaths, 'strong');

		expect(result.whitelist).toEqual(['/api/posts', '/api/comments', '/api/likes']);
	});

	it('should merge the aliases objects', () => {
		const { getAPIConfig } = require('../../../shared/registerHttpApi');
		config.aliases = { getUsers: '/api/users' };
		const aliases = { getPosts: '/api/posts' };
		const result = getAPIConfig('/api/users', config, aliases, [], methodPaths, 'strong');

		expect(result.aliases).toEqual({ getUsers: '/api/users', getPosts: '/api/posts' });
	});

	it('should set etag to "strong" if etag is undefined or "strong"', () => {
		const { getAPIConfig } = require('../../../shared/registerHttpApi');
		const result1 = getAPIConfig('/api/users', config, {}, [], methodPaths, undefined);
		const result2 = getAPIConfig('/api/users', config, {}, [], methodPaths, 'strong');

		expect(result1.etag).toBe('strong');
		expect(result2.etag).toBe('strong');
	});

	it('should set etag to weak if etag is weak', () => {
		const { getAPIConfig } = require('../../../shared/registerHttpApi');
		const result = getAPIConfig('/api/users', config, {}, [], methodPaths, 'weak');

		expect(result.etag).toBe('weak');
	});

	it('should set etag to false if etag is false', () => {
		const { getAPIConfig } = require('../../../shared/registerHttpApi');
		const result = getAPIConfig('/api/users', config, {}, [], methodPaths, false);

		expect(result.etag).toBe(false);
	});

	it('should set etag to true if etag is true', () => {
		const { getAPIConfig } = require('../../../shared/registerHttpApi');
		const result = getAPIConfig('/api/users', config, {}, [], methodPaths, true);

		expect(result.etag).toBe(true);
	});

	it('should execute etag function if etag is a function', () => {
		const etagFunction = () => 'test';

		const { getAPIConfig } = require('../../../shared/registerHttpApi');
		const result = getAPIConfig('/api/users', config, {}, [], methodPaths, etagFunction);

		expect(result.etag).toBe('test');
	});
});

describe('Test getAllAPIs method', () => {
	it('should return proper response when called with correct params', async () => {
		const { getAllAPIs } = require('../../../shared/registerHttpApi');
		const registeredModuleNames = ['auth', 'validators', 'token'];
		const apiName = 'http-status';
		const response = getAllAPIs(apiName, registeredModuleNames);
		expect(response).toEqual(getAllAPIsExpectedResponse);
	});
});

describe('Test getMethodName method', () => {
	it('should return POST when called with httpMethod:POST', async () => {
		const { getMethodName } = require('../../../shared/registerHttpApi');
		const response = getMethodName({ httpMethod: 'POST' });
		expect(response).toEqual('POST');
	});

	it('should return GET when called with httpMethod:GET', async () => {
		const { getMethodName } = require('../../../shared/registerHttpApi');
		const response = getMethodName({ httpMethod: 'GET' });
		expect(response).toEqual('GET');
	});

	it('should return GET when called with when empty object', async () => {
		const { getMethodName } = require('../../../shared/registerHttpApi');
		const response = getMethodName({});
		expect(response).toEqual('GET');
	});

	it('should throw error when called with null or undefined', async () => {
		const { getMethodName } = require('../../../shared/registerHttpApi');
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
		path: '/v3',
	};
	const registeredModuleNames = ['fee', 'interoperability', 'legacy', 'pos', 'random', 'token', 'validators'];

	it('should return correct api info when called with valid inputs', async () => {
		const { registerApi } = require('../../../shared/registerHttpApi');
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
		const { registerApi } = require('../../../shared/registerHttpApi');
		expect(() => registerApi(null, config, registeredModuleNames)).toThrow();
		expect(() => registerApi(apiNames, null, registeredModuleNames)).toThrow();
		expect(() => registerApi(apiNames, config, null)).toThrow();
	});

	it('should throw error when called with null inputs', async () => {
		const { registerApi } = require('../../../shared/registerHttpApi');
		expect(() => registerApi(null, null, null)).toThrow();
	});

	it('should throw error when called with undefined apiNames or config or registeredModuleNames', async () => {
		const { registerApi } = require('../../../shared/registerHttpApi');
		expect(() => registerApi(undefined, config, registeredModuleNames)).toThrow();
		expect(() => registerApi(apiNames, undefined, registeredModuleNames)).toThrow();
		expect(() => registerApi(apiNames, config, undefined)).toThrow();
	});

	it('should throw error when called with undefined inputs', async () => {
		const { registerApi } = require('../../../shared/registerHttpApi');
		expect(() => registerApi(undefined, undefined, undefined)).toThrow();
	});
});

describe('Test configureApi method', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});

	it('should return proper response when called with correct params', async () => {
		const { configureApi } = require('../../../shared/registerHttpApi');
		const response = configureApi(configureAPIPrefix, configureAPIMethods);

		expect(response).toEqual(configureApiResponse);
	});

	it('should return proper response when called with correct params and etag as false', async () => {
		const { configureApi } = require('../../../shared/registerHttpApi');
		const response = configureApi(configureAPIPrefixWithFalseEtag,
			configureAPIMethodsWithFalseEtag, false);

		expect(response).toEqual(configureAPIWithFalseEtagResponse);
	});

	it('should return empty response when called with empty params', async () => {
		const { configureApi } = require('../../../shared/registerHttpApi');
		expect(configureApi('/test', {})).toEqual({ aliases: {}, methodPaths: {}, whitelist: [] });
	});
});
