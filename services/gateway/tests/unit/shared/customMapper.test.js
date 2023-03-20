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
const { rootObj, mapObjectDefinition, mapObjectExpectedResponse } = require('../../constants/customMapper');

describe('Test resolvePath method', () => {
	const obj = {
		key1: {
			key11: {
				key111: 'value111',
			},
		},
	};

	it('should return correct value when called with valid obj and path', async () => {
		const response = resolvePath(obj, 'key1.key11');
		expect(response).toEqual(obj.key1.key11);
	});

	it('should return undefined when called with valid obj and non-existing path', async () => {
		const response = resolvePath(obj, 'key1.key12.key121');
		expect(response).toEqual(undefined);
	});

	it('should return undefined when called with null obj and non-existing path', async () => {
		const response = resolvePath(null, 'key1.key12.key121');
		expect(response).toEqual(undefined);
	});

	it('should return undefined when called with undefined obj and non-existing path', async () => {
		const response = resolvePath(undefined, 'key1.key12.key121');
		expect(response).toEqual(undefined);
	});

	it('should return undefined when called with valid obj and null path', async () => {
		const response = resolvePath(obj, null);
		expect(response).toEqual(undefined);
	});

	it('should return undefined when called with valid obj and undefined path', async () => {
		const response = resolvePath(obj, undefined);
		expect(response).toEqual(undefined);
	});

	it('should return undefined when called with null obj and null path', async () => {
		const response = resolvePath(null, null);
		expect(response).toEqual(undefined);
	});

	it('should return undefined when called with null obj and undefined path', async () => {
		const response = resolvePath(null, undefined);
		expect(response).toEqual(undefined);
	});

	it('should return undefined when called with undefined obj and null path', async () => {
		const response = resolvePath(undefined, null);
		expect(response).toEqual(undefined);
	});

	it('should return undefined when called with undefined obj and undefined path', async () => {
		const response = resolvePath(undefined, undefined);
		expect(response).toEqual(undefined);
	});
});

describe('Test mapObject method', () => {
	it('should return correctly mapped object when called with valid rootObj and mapObjectDefinition', async () => {
		const response = mapObject(rootObj, mapObjectDefinition);
		expect(response).toEqual(mapObjectExpectedResponse);
	});

	it('should throw error when called with null rootObj or mapObjectDefinition', async () => {
		expect(() => mapObject(null, mapObjectDefinition)).toThrow();
		expect(() => mapObject(rootObj, null)).toThrow();
		expect(() => mapObject(null, null)).toThrow();
	});

	it('should throw error when called with undefined rootObj or mapObjectDefinition', async () => {
		expect(() => mapObject(undefined, mapObjectDefinition)).toThrow();
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
		const definition = [mapObjectDefinition];
		const expectedResponse = [mapObjectExpectedResponse];

		const response = mapArray(rootObj, definition);
		expect(response).toEqual(expectedResponse);
	});

	it('should return correctly mapped array when called with [string,object] definition array', async () => {
		const key = 'some key';
		const definition = [key, mapObjectDefinition];
		const expectedResponse = [key, { [key]: mapObjectExpectedResponse.data }];

		const response = mapArray(rootObj, definition);
		expect(response).toEqual(expectedResponse);
	});

	it('should throw error mapped array when called with null rootObj or definition', async () => {
		expect(() => mapArray(null, mapObjectDefinition)).toThrow();
		expect(() => mapArray(rootObj, null)).toThrow();
		expect(() => mapArray(null, null)).toThrow();
	});

	it('should throw error mapped array when called with undefined rootObj or definition', async () => {
		expect(() => mapArray(undefined, mapObjectDefinition)).toThrow();
		expect(() => mapArray(rootObj, undefined)).toThrow();
		expect(() => mapArray(undefined, undefined)).toThrow();
	});
});

describe('Test mapper method', () => {
	it('should return correctly mapped object when called with valid data object and def object', async () => {
		const response = mapper(rootObj, mapObjectDefinition);
		expect(response).toEqual(mapObjectExpectedResponse);
	});

	it('should return correctly mapped array when called with valid data object and def array', async () => {
		const definition = [mapObjectDefinition];
		const expectedResponse = [mapObjectExpectedResponse];

		const response = mapArray(rootObj, definition);
		expect(response).toEqual(expectedResponse);
	});

	it('should throw error mapped array when called with null data or def', async () => {
		expect(() => mapArray(null, mapObjectDefinition)).toThrow();
		expect(() => mapArray(rootObj, null)).toThrow();
		expect(() => mapArray(null, null)).toThrow();
	});

	it('should throw error mapped array when called with undefined data or def', async () => {
		expect(() => mapArray(undefined, mapObjectDefinition)).toThrow();
		expect(() => mapArray(rootObj, undefined)).toThrow();
		expect(() => mapArray(undefined, undefined)).toThrow();
	});
});
