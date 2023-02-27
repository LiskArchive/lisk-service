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
const { convertType, mapParam } = require('../../shared/registerHttpApi');

describe('Test convertType method', () => {
	it('should return number when trying to convert string to number', async () => {
		const response = convertType('123', 'number');
		expect(typeof response).toEqual('number');
		expect(response).toEqual(123);
	});

	it('should return number when trying to convert number to string', async () => {
		const response = convertType(123, 'string');
		expect(typeof response).toEqual('string');
		expect(response).toEqual('123');
	});

	it('should return number when trying to convert array to string', async () => {
		const response = convertType(new Array(...[1, 2, 3]), 'string');
		expect(typeof response).toEqual('string');
		expect(response).toEqual('1,2,3');
	});

	it('should return number when trying to convert string to boolean', async () => {
		const response = convertType('true', 'boolean');
		expect(typeof response).toEqual('boolean');
		expect(response).toEqual(true);
	});

	it('should return param type when for unknown conversion', async () => {
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
