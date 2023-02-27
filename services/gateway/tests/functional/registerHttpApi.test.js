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
const { mapParamWithType, transformParams } = require('../../shared/registerHttpApi');

describe('Test mapParamWithType method', () => {
	const source = {
		key_str: 'val_str',
		key_bool: true,
		key_number: 123,
	};

	it('should return mapped value when called with valid params', async () => {
		const originalSetup = 'key_number';
		const response = mapParamWithType(source, originalSetup, 'new_key');
		expect(response).toEqual({
			key: 'new_key',
			value: source[originalSetup],
		});
	});

	it('should returns converted & mapped value when called with type string', async () => {
		const originalSetup = 'key_number';
		const response = mapParamWithType(source, `${originalSetup},string`, 'new_key');
		expect(response).toEqual({
			key: 'new_key',
			value: String(source[originalSetup]),
		});
	});

	it('should throw error when source is null or undefined', async () => {
		const originalSetup = 'key_number';
		expect(() => mapParamWithType(null, originalSetup, 'new_key')).toThrow();
		expect(() => mapParamWithType(undefined, originalSetup, 'new_key')).toThrow();
	});

	it('should return throw error when originalSetup is null or undefined', async () => {
		expect(() => mapParamWithType(source, null, 'new_key')).toThrow();
		expect(() => mapParamWithType(source, undefined, 'new_key')).toThrow();
	});

	it('should return undefined value when mappingKey is null or undefined', async () => {
		const originalSetup = 'key_number';
		// Null
		const response = mapParamWithType(source, originalSetup, null);
		expect(response).toEqual({});

		// Undefined
		const response2 = mapParamWithType(source, originalSetup, undefined);
		expect(response2).toEqual({});
	});
});

describe.only('Test transformParams method', () => {
	const params = {
		key_str: 'val_str',
		key_bool: true,
		key_number: 123,
		obj: { key: 'value' },
		arr: [1, 2, 3],
	};

	const specs = {
		new_key_str: 'key_str, string',
		key_bool: '=,boolean',
		str_from_number: 'key_number,string',
		obj: '=',
		arr: '=',
	};

	it('should return mapped object when called with valid params', async () => {
		const response = transformParams(params, specs);
		expect(response).toEqual({
			new_key_str: 'val_str',
			key_bool: true,
			str_from_number: '123',
			obj: { key: 'value' },
			arr: [1, 2, 3],
		});
	});

	it('should throw error when called null params', async () => {
        expect(() => transformParams(null, specs)).toThrow();
    });

    it('should return mapped object when called with undefined params', async () => {
        const response = transformParams(undefined, specs);
		expect(response).toEqual({
			new_key_str: undefined,
			key_bool: undefined,
			str_from_number: undefined,
			obj: undefined,
			arr: undefined,
		});
	});

    it('should throw error when called with null specs', async () => {
        expect(() => transformParams(params, null)).toThrow();
	});

    it('should throw error object when called with undefined specs', async () => {
        expect(() => transformParams(params, undefined)).toThrow();
	});
});
