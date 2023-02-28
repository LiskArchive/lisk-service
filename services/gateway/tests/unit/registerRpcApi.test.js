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
} = require('../../shared/registerRpcApi');

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

	it('should throw when called with null', async () => {
		expect(() => dropOneSlashAtBeginning(null)).toThrow();
	});

	it('should throw when called with undefined', async () => {
		expect(() => dropOneSlashAtBeginning(undefined)).toThrow();
	});
});

describe('Test curlyBracketsToColon method', () => {
	it('should converted string when called with a string having curly braces', async () => {
		const response = curlyBracketsToColon('url/{param1}/{param2}');
		expect(response).toEqual('url/:param1/:param2');
	});

	it('should original string when called with a string which does not have curly braces', async () => {
		const response = curlyBracketsToColon('url/param1/param2');
		expect(response).toEqual('url/param1/param2');
	});

	it('should empty string when called with empty string', async () => {
		const response = curlyBracketsToColon('');
		expect(response).toEqual('');
	});

	it('should throw when called with null', async () => {
		expect(() => curlyBracketsToColon(null)).toThrow();
	});

	it('should throw when called with undefined', async () => {
		expect(() => curlyBracketsToColon(undefined)).toThrow();
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
});

describe('Test mapParam method', () => {
	const source = {
		originalKey: 'originalValue',
		mappingKey: 'mappingValue',
	};

	it('should return value of mapping key when originalKey is `=`', async () => {
		const response = mapParam(source, '=', 'mappingKey');
		expect(response).toEqual({
			key: 'mappingKey',
			value: 'mappingValue',
		});
	});

	it('should return value of mapping key when originalKey is not `=`', async () => {
		const response = mapParam(source, 'originalKey', 'mappingKey');
		expect(response).toEqual({
			key: 'mappingKey',
			value: 'originalValue',
		});
	});

	it('should return empty object when mappingKey is null or undefined', async () => {
		// Null
		const response = mapParam(source, 'originalKey', null);
		expect(response).toEqual({});

		// Undefined
		const response2 = mapParam(source, 'originalKey', null);
		expect(response2).toEqual({});
	});

	it('should return undefined value when originalKey is null or undefined', async () => {
		// Null
		const response = mapParam(source, null, 'mappingKey');
		expect(response).toEqual({
			key: 'mappingKey',
			value: undefined,
		});

		// Undefined
		const response2 = mapParam(source, undefined, 'mappingKey');
		expect(response2).toEqual({
			key: 'mappingKey',
			value: undefined,
		});
	});

	it('should throw error when source is null or undefined', async () => {
		// Null
		expect(() => mapParam(null, 'originalKey', 'mappingKey')).toThrow();

		// Undefined
		expect(() => mapParam(null, 'originalKey', 'mappingKey')).toThrow();
	});
});
