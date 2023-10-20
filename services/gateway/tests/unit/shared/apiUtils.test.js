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
	dropOneSlashAtBeginning,
	curlyBracketsToColon,
	convertType,
	mapParam,
	mapParamWithType,
	transformParams,
	transformRequest,
	transformResponse,
	transformPath,
} = require('../../../shared/apiUtils');

const {
	sourceForMapParam,
	methodDefForTransformResponse,
	dataForTransformResponse,
	expectedResponseForTransformResponse,
	paramsForTransformRequest,
	methodDefForTransformRequest,
	expectedResponseForTransformRequest,
	sourceForMapParamWithType,
	paramsForTransformParams,
	specsForTransformParams,
	expectedResponseForTransformParams,
} = require('../../constants/registerApi');

describe('Test API utilities', () => {
	describe('Test dropOneSlashAtBeginning method', () => {
		it('should return string without first `/` when called with a string having `/` in beginning', async () => {
			const response = dropOneSlashAtBeginning('//url//param');
			expect(response).toEqual('/url//param');
		});

		it('should return passed string when called with a string which does not have `/` in beginning', async () => {
			const response = dropOneSlashAtBeginning('url//param');
			expect(response).toEqual('url//param');
		});

		it('should return empty string when called with empty string', async () => {
			const response = dropOneSlashAtBeginning('');
			expect(response).toEqual('');
		});

		it('should throw error when called with null or undefined', async () => {
			[null, undefined].forEach(param => expect(() => dropOneSlashAtBeginning(param)).toThrow());
		});
	});

	describe('Test curlyBracketsToColon method', () => {
		it('should return converted string when called with a string having curly braces', async () => {
			const response = curlyBracketsToColon('url/{param1}/{param2}');
			expect(response).toEqual('url/:param1/:param2');
		});

		it('should return original string when called with a string which does not have curly braces', async () => {
			const response = curlyBracketsToColon('url/param1/param2');
			expect(response).toEqual('url/param1/param2');
		});

		it('should return empty string when called with empty string', async () => {
			const response = curlyBracketsToColon('');
			expect(response).toEqual('');
		});

		it('should throw error when called with null or undefined', async () => {
			[null, undefined].forEach(param => expect(() => curlyBracketsToColon(param)).toThrow());
		});
	});

	describe('Test convertType method', () => {
		it('should return number when called to convert string to number', async () => {
			const response = convertType('123', 'number');
			expect(typeof response).toEqual('number');
			expect(response).toEqual(123);
		});

		it('should return string when called to convert number to string', async () => {
			const response = convertType(123, 'string');
			expect(typeof response).toEqual('string');
			expect(response).toEqual('123');
		});

		it('should return string when called to convert array to string', async () => {
			const response = convertType(new Array(...[1, 2, 3]), 'string');
			expect(typeof response).toEqual('string');
			expect(response).toEqual('1,2,3');
		});

		it('should return string when called to convert array to string', async () => {
			const response = convertType([1, 2, 3], 'string');
			expect(typeof response).toEqual('string');
			expect(response).toEqual('1,2,3');
		});

		it('should return boolean when called to convert string to boolean', async () => {
			const response = convertType('true', 'boolean');
			expect(typeof response).toEqual('boolean');
			expect(response).toEqual(true);
		});

		it('should return param type when called for unknown conversion', async () => {
			const response = convertType(true, 'object');
			expect(typeof response).toEqual('boolean');
			expect(response).toEqual(true);
		});

		it('should throw error when called with null item', async () => {
			expect(() => convertType(null, 'object')).toThrow();
		});

		it('should return param type when called with undefined item', async () => {
			const response = convertType(undefined, 'string');
			expect(response).toEqual(undefined);
		});

		it('should return passed item when called with null toType', async () => {
			const item = 'str';
			const response = convertType(item, null);
			expect(response).toEqual(item);
		});

		it('should return passed item when called with undefined toType', async () => {
			const item = 'str';
			const response = convertType(item, undefined);
			expect(response).toEqual(item);
		});
	});

	describe('Test mapParam method', () => {
		const source = sourceForMapParam;

		it('should return value of mapping key when originalKey is `=`', async () => {
			const response = mapParam(source, '=', 'mappingKey');
			expect(response).toEqual({
				key: 'mappingKey',
				value: 'mappingValue',
			});
		});

		it('should return value of original key when originalKey is not `=`', async () => {
			const response = mapParam(source, 'originalKey', 'mappingKey');
			expect(response).toEqual({
				key: 'mappingKey',
				value: 'originalValue',
			});
		});

		it('should return empty object when mappingKey is null or undefined', async () => {
			[null, undefined].forEach(mappingKey => {
				const response = mapParam(source, 'originalKey', mappingKey);
				expect(response).toEqual({});
			});
		});

		it('should return undefined value when originalKey is null or undefined', async () => {
			[null, undefined].forEach(originalKey => {
				const response = mapParam(source, originalKey, 'mappingKey');
				expect(response).toEqual({
					key: 'mappingKey',
					value: undefined,
				});
			});
		});

		it('should throw error when source is null or undefined', async () => {
			[null, undefined].forEach(sourceParam =>
				expect(() => mapParam(sourceParam, 'originalKey', 'mappingKey')).toThrow(),
			);
		});
	});

	describe('Test mapParamWithType method', () => {
		const source = sourceForMapParamWithType;

		it('should return mapped value when called with valid params', async () => {
			const originalSetup = 'key_number';
			const mappingKey = 'new_key';
			const response = mapParamWithType(source, originalSetup, mappingKey);
			expect(response).toEqual({
				key: mappingKey,
				value: source[originalSetup],
			});
		});

		it('should return converted & mapped value when called with type string', async () => {
			const originalSetupKey = 'key_number';
			const mappingKey = 'new_key';
			const response = mapParamWithType(source, `${originalSetupKey},string`, mappingKey);
			expect(response).toEqual({
				key: mappingKey,
				value: String(source[originalSetupKey]),
			});
		});

		it('should throw error when source is null or undefined', async () => {
			const originalSetup = 'key_number';
			const mappingKey = 'new_key';
			[null, undefined].forEach(sourceParam =>
				expect(() => mapParamWithType(sourceParam, originalSetup, mappingKey)).toThrow(),
			);
		});

		it('should throw error when originalSetup is null or undefined', async () => {
			const mappingKey = 'new_key';
			[null, undefined].forEach(originalSetup => {
				expect(() => mapParamWithType(source, originalSetup, mappingKey)).toThrow();
			});
		});

		it('should return empty object when mappingKey is null or undefined', async () => {
			const originalSetup = 'key_number';
			[null, undefined].forEach(mappingKey => {
				const response = mapParamWithType(source, originalSetup, mappingKey);
				expect(response).toEqual({});
			});
		});
	});

	describe('Test transformPath method', () => {
		it('should return converted string when called with a string having curly braces and `/` in beginning', async () => {
			const response = transformPath('//url/{param1}/{param2}');
			expect(response).toEqual('/url/:param1/:param2');
		});

		it('should return converted string when called with a string having curly braces', async () => {
			const response = transformPath('url/{param1}/{param2}');
			expect(response).toEqual('url/:param1/:param2');
		});

		it('should return original string when called with a string which does not have curly braces', async () => {
			const response = transformPath('url/param1/param2');
			expect(response).toEqual('url/param1/param2');
		});

		it('should return empty string when called with empty string', async () => {
			const response = transformPath('');
			expect(response).toEqual('');
		});

		it('should throw error when called with null or undefined ', async () => {
			[null, undefined].forEach(param => expect(() => transformPath(param)).toThrow());
		});
	});

	describe('Test transformParams method', () => {
		const params = paramsForTransformParams;
		const specs = specsForTransformParams;

		it('should return mapped object when called with valid params', async () => {
			const response = transformParams(params, specs);
			expect(response).toEqual(expectedResponseForTransformParams);
		});

		it('should throw error when called with null params', async () => {
			expect(() => transformParams(null, specs)).toThrow();
		});

		it('should return object of undefined values when called with undefined params', async () => {
			const response = transformParams(undefined, specs);
			expect(response).toEqual({
				new_key_str: undefined,
				key_bool: undefined,
				str_from_number: undefined,
				obj: undefined,
				arr: undefined,
			});
		});

		it('should throw error when called with null or undefined specs', async () => {
			[null, undefined].forEach(specsParam =>
				expect(() => transformParams(params, specsParam)).toThrow(),
			);
		});
	});

	describe('Test transformRequest method', () => {
		const params = paramsForTransformRequest;
		const methodDef = methodDefForTransformRequest;

		it('should return correctly mapped params when called with valid params and methodDef', async () => {
			const response = transformRequest(methodDef, params);
			expect(response).toEqual(expectedResponseForTransformRequest);
		});

		it('should return params when called with null methodDef', async () => {
			const response = transformRequest(null, params);
			expect(response).toEqual(params);
		});

		it('should return params when called with undefined methodDef', async () => {
			const response = transformRequest(undefined, params);
			expect(response).toEqual(params);
		});

		it('should return null when called with null params', async () => {
			const response = transformRequest(methodDef, null);
			expect(response).toEqual(null);
		});

		it('should return all keys with undefined value when called with undefined params', async () => {
			const response = transformRequest(methodDef, undefined);
			expect(response).toEqual({
				chainID: undefined,
				chainName: undefined,
				limit: undefined,
				network: undefined,
				offset: undefined,
				search: undefined,
				sort: undefined,
				tokenID: undefined,
				tokenName: undefined,
			});
		});

		it('should return null when called with null methodDef and params', async () => {
			const response = transformRequest(null, null);
			expect(response).toEqual(null);
		});

		it('should return undefined null when called with undefined methodDef and params', async () => {
			const response = transformRequest(undefined, undefined);
			expect(response).toEqual(undefined);
		});
	});

	describe('Test transformResponse method', () => {
		const methodDef = methodDefForTransformResponse;
		const data = dataForTransformResponse;

		it('should return correctly mapped data when called with valid methodDef and data', async () => {
			const response = await transformResponse(methodDef, data);
			expect(response).toEqual(expectedResponseForTransformResponse);
		});

		it('should return data when called with null or undefined methodDef', async () => {
			[null, undefined].forEach(async methodDefParam => {
				const response = await transformResponse(methodDefParam, data);
				expect(response).toEqual(data);
			});
		});

		it('should throw error when called with null or undefined data', async () => {
			[null, undefined].forEach(dataParam =>
				expect(() => transformResponse(methodDef, dataParam)).rejects.toThrow(),
			);
		});

		it('should return null when called with null methodDef and data', async () => {
			const response = await transformResponse(null, null);
			expect(response).toEqual(null);
		});

		it('should return undefined null when called with undefined methodDef and data', async () => {
			const response = await transformResponse(undefined, undefined);
			expect(response).toEqual(undefined);
		});
	});
});
