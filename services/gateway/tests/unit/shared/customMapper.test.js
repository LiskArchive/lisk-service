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
	resolvePath,
	mapObject,
	mapArray,
	mapper,
} = require('../../../shared/customMapper');
const { rootObj, definitionObj, mapObjectExpectedResponse } = require('../../constants/customMapper');

describe('Test resolvePath method', () => {
	const obj = {
		key1: {
			key11: {
				key111: 'value111',
			},
		},
	};

	it('should return correct value when called with valid obj and exiting path', async () => {
		const response = resolvePath(obj, 'key1.key11');
		expect(response).toEqual(obj.key1.key11);
	});

	it('should return undefined when called with valid obj and non-existing path', async () => {
		const response = resolvePath(obj, 'key1.key12.key121');
		expect(response).toEqual(undefined);
	});

	it('should return undefined when called with null obj or path', async () => {
		expect(resolvePath(null, 'key1.key12.key121')).toEqual(undefined);
		expect(resolvePath(obj, null)).toEqual(undefined);
		expect(resolvePath(null, null)).toEqual(undefined);
	});

	it('should return undefined when called with undefined obj or path', async () => {
		expect(resolvePath(undefined, 'key1.key12.key121')).toEqual(undefined);
		expect(resolvePath(obj, undefined)).toEqual(undefined);
		expect(resolvePath(undefined, undefined)).toEqual(undefined);
	});
});

describe('Test mapObject method', () => {
	it('should return correctly mapped object when called with valid rootObj and definition', async () => {
		const response = mapObject(rootObj, definitionObj);
		expect(response).toEqual(mapObjectExpectedResponse);
	});

	it('should throw error when called with null rootObj or definition', async () => {
		expect(() => mapObject(null, definitionObj)).toThrow();
		expect(() => mapObject(rootObj, null)).toThrow();
		expect(() => mapObject(null, null)).toThrow();
	});

	it('should throw error when called with undefined rootObj or definition', async () => {
		expect(() => mapObject(undefined, definitionObj)).toThrow();
		expect(() => mapObject(rootObj, undefined)).toThrow();
		expect(() => mapObject(undefined, undefined)).toThrow();
	});
});

describe('Test mapArray method', () => {
	it('should return definition array when called with a definition array of one string', async () => {
		const arr = ['some string'];
		const definition = [
			'different_key',
		];
		const response = mapArray(arr, definition);
		expect(response).toEqual(definition);
	});

	it('should return definition with first element when called with a definition array of strings', async () => {
		const arr = ['some string'];
		const definition = [
			'different_key1',
			'different_key2',
		];
		const response = mapArray(arr, definition);
		expect(response).toEqual([definition[0]]);
	});

	it('should return correctly mapped array when called with valid rootObj and definition array', async () => {
		const definition = [definitionObj];
		const expectedResponse = [mapObjectExpectedResponse];

		const response = mapArray(rootObj, definition);
		expect(response).toEqual(expectedResponse);
	});

	it('should return correctly mapped array when called with [string,object] definition array', async () => {
		const key = 'some key';
		const definition = [key, definitionObj];
		const expectedResponse = [key, { [key]: mapObjectExpectedResponse.data }];

		const response = mapArray(rootObj, definition);
		expect(response).toEqual(expectedResponse);
	});

	it('should throw error when called with null rootObj or definition', async () => {
		expect(() => mapArray(null, definitionObj)).toThrow();
		expect(() => mapArray(rootObj, null)).toThrow();
		expect(() => mapArray(null, null)).toThrow();
	});

	it('should throw error when called with undefined rootObj or definition', async () => {
		expect(() => mapArray(undefined, definitionObj)).toThrow();
		expect(() => mapArray(rootObj, undefined)).toThrow();
		expect(() => mapArray(undefined, undefined)).toThrow();
	});
});

describe('Test mapper method', () => {
	it('should return correctly mapped object when called with valid data object and def object', async () => {
		const response = mapper(rootObj, definitionObj);
		expect(response).toEqual(mapObjectExpectedResponse);
	});

	it('should return correctly mapped array when called with valid data object and def array', async () => {
		const definition = [definitionObj];
		const expectedResponse = [mapObjectExpectedResponse];

		const response = mapper(rootObj, definition);
		expect(response).toEqual(expectedResponse);
	});

	it('should throw error when called with null or undefined data', async () => {
		expect(() => mapper(null, definitionObj)).toThrow();
		expect(() => mapper(undefined, definitionObj)).toThrow();
	});

	it('should return empty object when called with null or undefined def', async () => {
		expect(mapper(rootObj, null)).toEqual({});
		expect(mapper(rootObj, undefined)).toEqual({});
	});

	it('should return empty object when both data and def are null or undefined', async () => {
		expect(mapper(null, null)).toEqual({});
		expect(mapper(undefined, undefined)).toEqual({});
	});
});
