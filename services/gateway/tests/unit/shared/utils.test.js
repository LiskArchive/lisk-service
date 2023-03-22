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
const { transformParams, requireAllJson, getSwaggerDescription, isValidNonEmptyResponse } = require('../../../shared/utils');
const { transformParamsInput, transformParamsExpectedResponse, requireAllJsonExpectedResponse } = require('../../constants/utils');

describe('Test transformParams method', () => {
	it('should return correctly mapped params when called with all possible key types', async () => {
		const response = transformParams('', transformParamsInput);
		expect(response).toEqual(transformParamsExpectedResponse);
	});

	it('should throw error when called null or undefined params', async () => {
		expect(() => transformParams('', null)).toThrow();
		expect(() => transformParams('', undefined)).toThrow();
	});
});

describe('Test requireAllJson method', () => {
	it('should return all json combined when called valid apiName', async () => {
		const response = requireAllJson('http-exports');
		expect(response).toEqual(requireAllJsonExpectedResponse);
	});

	it('should throw error when called null or undefined apiName', async () => {
		expect(() => requireAllJson(null)).toThrow();
		expect(() => requireAllJson(undefined)).toThrow();
	});
});

describe('Test getSwaggerDescription method', () => {
	it('should return correct description when called with object having description and rpcMethod', async () => {
		const params = {
			description: 'some description',
			rpcMethod: 'some rpc method',
		};
		const expectedResponse = `${params.description}\n RPC => ${params.rpcMethod}`;
		const response = getSwaggerDescription(params);
		expect(response).toEqual(expectedResponse);
	});

	it('should return expected description when called with empty object', async () => {
		const params = {};
		const expectedResponse = `${params.description}\n RPC => ${params.rpcMethod}`;
		const response = getSwaggerDescription(params);
		expect(response).toEqual(expectedResponse);
	});

	it('should throw error when called null or undefined params', async () => {
		expect(() => getSwaggerDescription(null)).toThrow();
		expect(() => getSwaggerDescription(undefined)).toThrow();
	});
});

describe('Test isValidNonEmptyResponse method', () => {
	it('should return correct description when res.data is non-empty array', async () => {
		const response = isValidNonEmptyResponse({ data: ['1'] });
		expect(response).toEqual(true);
	});

	it('should return correct description when res.data is empty array', async () => {
		const response = isValidNonEmptyResponse({ data: [] });
		expect(response).toEqual(false);
	});

	it('should return correct description when res.data is non-empty object', async () => {
		const response = isValidNonEmptyResponse({ data: { key: 'value' } });
		expect(response).toEqual(true);
	});

	it('should return correct description when res.data is empty object', async () => {
		const response = isValidNonEmptyResponse({ data: {} });
		expect(response).toEqual(false);
	});

	it('should throw error when called null or undefined res', async () => {
		expect(() => isValidNonEmptyResponse(null)).toThrow();
		expect(() => isValidNonEmptyResponse(undefined)).toThrow();
	});
});
