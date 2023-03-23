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
	mapObjectWithProperty,
	objDiff,
	arrDiff,
	dropEmptyProps,
	parseParams,
	validate,
} = require('../../../shared/paramValidator');
const {
	mapObjectWithPropertyObj,
	mapObjectWithPropertyExpectedResponse,
	mapObjectWithPropertyPropName,
	objDiffReference,
	objDiffExpectedResponse,
	objDiffTestedObject,
	dropEmptyPropsInput,
	dropEmptyPropsExpectedResponse,
	parseParamsInput,
	parseParamsExpectedResponse,
	validateRawInputParams,
	validateSpecs,
	validateExpectedParamReport,
	validateRawInputParamsWithInvalidKey,
	validateInvalidKeyExpectedResponse,
} = require('../../constants/paramValidator');

describe('Test mapObjectWithProperty method', () => {
	it('should return correctly mapped object when called with valid obj and propName', async () => {
		const response = await mapObjectWithProperty(mapObjectWithPropertyObj, 'default');
		expect(response).toEqual(mapObjectWithPropertyExpectedResponse);
	});

	it('should throw error when called with null or undefined obj', async () => {
		expect(() => mapObjectWithProperty(null, mapObjectWithPropertyPropName)).toThrow();
		expect(() => mapObjectWithProperty(undefined, mapObjectWithPropertyPropName)).toThrow();
	});

	it('should return empty object when called with null or undefined propName', async () => {
		expect(mapObjectWithProperty(mapObjectWithPropertyObj, null)).toEqual({});
		expect(mapObjectWithProperty(mapObjectWithPropertyObj, undefined)).toEqual({});
	});

	it('should throw error when obj and propName both are null or undefined', async () => {
		expect(() => mapObjectWithProperty(null, null)).toThrow();
		expect(() => mapObjectWithProperty(undefined, undefined)).toThrow();
	});
});

describe('Test objDiff method', () => {
	it('should return array of diff keys when called with two objects', async () => {
		const response = await objDiff(objDiffReference, objDiffTestedObject);
		expect(response).toEqual(objDiffExpectedResponse);
	});

	it('should throw error when called with null reference or testedObject', async () => {
		expect(() => objDiff(null, objDiffTestedObject)).toThrow();
		expect(() => objDiff(objDiffReference, null)).toThrow();
		expect(() => objDiff(null, null)).toThrow();
	});

	it('should throw error when called with undefined reference or testedObject', async () => {
		expect(() => objDiff(undefined, objDiffTestedObject)).toThrow();
		expect(() => objDiff(objDiffReference, undefined)).toThrow();
		expect(() => objDiff(undefined, undefined)).toThrow();
	});
});

describe('Test arrDiff method', () => {
	const arr1 = ['key1', 'key2', 'key3'];
	const arr2 = ['key2', 'key4', 'key6'];
	const expectedResponse = ['key4', 'key6'];

	it('should return array of diff keys when called with two arrays', async () => {
		const response = await arrDiff(arr1, arr2);
		expect(response).toEqual(expectedResponse);
	});

	it('should throw error when called with null arr1 or arr2', async () => {
		expect(() => arrDiff(null, arr2)).toThrow();
		expect(() => arrDiff(arr1, null)).toThrow();
		expect(() => arrDiff(null, null)).toThrow();
	});

	it('should throw error when called with undefined arr1 or arr2', async () => {
		expect(() => arrDiff(undefined, arr2)).toThrow();
		expect(() => arrDiff(arr1, undefined)).toThrow();
		expect(() => arrDiff(undefined, undefined)).toThrow();
	});
});

describe('Test dropEmptyProps method', () => {
	it('should return object without empty props when called an object', async () => {
		const response = await dropEmptyProps(dropEmptyPropsInput);
		expect(response).toEqual(dropEmptyPropsExpectedResponse);
	});

	it('should throw error when called with not an object', async () => {
		expect(() => dropEmptyProps(null)).toThrow();
		expect(() => dropEmptyProps(undefined)).toThrow();
	});

	it('should return empty object when called with integer or boolean', async () => {
		expect(dropEmptyProps(1)).toEqual({});
		expect(dropEmptyProps(true)).toEqual({});
	});

	it('should return object mapping each element when called with string or array', async () => {
		expect(dropEmptyProps('str')).toEqual({
			0: 's',
			1: 't',
			2: 'r',
		});
		expect(dropEmptyProps(['a', 'b', 'c'])).toEqual({
			0: 'a',
			1: 'b',
			2: 'c',
		});
	});
});

describe('Test parseParams method', () => {
	it('should return object without empty props when called an object', async () => {
		const response = await parseParams(parseParamsInput);
		expect(response).toEqual(parseParamsExpectedResponse);
	});

	it('should throw error when called with an empty object or non-object', async () => {
		expect(() => parseParams({})).toThrow();
		expect(() => parseParams([1, 2, 3])).toThrow();
		expect(() => parseParams('string')).toThrow();
		expect(() => parseParams(5)).toThrow();
		expect(() => parseParams(true)).toThrow();
	});

	it('should throw error when called with null or undefined', async () => {
		expect(() => parseParams(null)).toThrow();
		expect(() => parseParams(undefined)).toThrow();
	});
});

describe('Test validate method', () => {
	xit('should return expected param report when called with valid rawInputParams and specs', async () => {
		const response = await validate(validateRawInputParams, validateSpecs);
		expect(response).toEqual(validateExpectedParamReport);
	});

	it('should return expected param report when called with valid rawInputParams and specs', async () => {
		const response = await validate(validateRawInputParamsWithInvalidKey, validateSpecs);
		expect(response).toEqual(validateInvalidKeyExpectedResponse);
	});
});
