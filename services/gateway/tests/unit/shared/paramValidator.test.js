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
/* eslint-disable mocha/max-top-level-suites */
const {
	mapObjectWithProperty,
	objDiff,
	arrDiff,
	dropEmptyProps,
	parseParams,
	validate,
	validateFromParamPairings,
	checkMissingParams,
	parseDefaultParams,
	parseAllParams,
	looseSpecParams,
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
	checkMissingParamsRouteParams,
	checkMissingParamsRequestParams,
	parseDefaultParamsObj,
	parseDefaultParamsExpectedResponse,
	parseAllParamsRouteParams,
	parseAllParamsRequestParams,
	parseAllParamsExpectedResponse,
	looseSpecParamsInput,
	looseSpecParamsExpectedResponse,
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
		const response = validate(validateRawInputParams, validateSpecs);
		expect(response).toEqual(validateExpectedParamReport);
	});

	it('should return expected param report when raw input has invalid key', async () => {
		const response = validate(validateRawInputParamsWithInvalidKey, validateSpecs);
		expect(response).toEqual(validateInvalidKeyExpectedResponse);
	});
});

describe('Test validateFromParamPairings method', () => {
	const inputParamKeys = ['key1', 'key2', 'key3'];
	const schemaParamPairings = [
		['key1', 'key2'],
	];

	it('should return empty array when inputParamKeys is part of schema paramPairings', async () => {
		const response = validateFromParamPairings(true, inputParamKeys, schemaParamPairings);
		expect(response).toEqual([]);
	});

	it('should return empty array when paramsRequired is false', async () => {
		const response = validateFromParamPairings(false, inputParamKeys, schemaParamPairings);
		expect(response).toEqual([]);
	});

	it('should return schema paramPairings when inputParamKeys is not part of schema paramPairings', async () => {
		const response = validateFromParamPairings(
			true,
			[inputParamKeys[0]],
			schemaParamPairings,
		);
		expect(response).toEqual(schemaParamPairings);
	});

	it('should return empty array when called with null or undefined paramPairings', async () => {
		expect(validateFromParamPairings(null, inputParamKeys, schemaParamPairings)).toEqual([]);
		expect(validateFromParamPairings(undefined, inputParamKeys, schemaParamPairings)).toEqual([]);
	});

	it('should throw error when called with null inputParamKeys or schemaParamPairings', async () => {
		expect(() => validateFromParamPairings(true, null, schemaParamPairings)).toThrow();
		expect(() => validateFromParamPairings(true, inputParamKeys, null)).toThrow();
		expect(() => validateFromParamPairings(true, null, null)).toThrow();
	});

	it('should throw error when called with undefined inputParamKeys or schemaParamPairings', async () => {
		expect(() => validateFromParamPairings(true, undefined, schemaParamPairings)).toThrow();
		expect(() => validateFromParamPairings(true, inputParamKeys, undefined)).toThrow();
		expect(() => validateFromParamPairings(true, undefined, undefined)).toThrow();
	});
});

describe('Test checkMissingParams method', () => {
	it('should return empty array when all required params are present in request', async () => {
		const response = checkMissingParams(
			checkMissingParamsRouteParams,
			checkMissingParamsRequestParams,
		);
		expect(response).toEqual([]);
	});

	it('should array of missing keys when required params are missing from requestParams', async () => {
		const response = checkMissingParams(checkMissingParamsRouteParams, {
			key1: {
				key11: 'val11',
				required: true,
			},
		});
		expect(response).toEqual(['key2']);
	});

	it('should throw error when called with null routeParams or requestParams)', async () => {
		expect(() => checkMissingParams(null, checkMissingParamsRequestParams)).toThrow();
		expect(() => checkMissingParams(checkMissingParamsRouteParams, null)).toThrow();
		expect(() => checkMissingParams(null, null)).toThrow();
	});

	it('should throw error when called with undefined routeParams or requestParams)', async () => {
		expect(() => checkMissingParams(undefined, checkMissingParamsRequestParams)).toThrow();
		expect(() => checkMissingParams(checkMissingParamsRouteParams, undefined)).toThrow();
		expect(() => checkMissingParams(undefined, undefined)).toThrow();
	});
});

describe('Test parseDefaultParams method', () => {
	it('should return correctly mapped object when called with valid obj', async () => {
		const response = await parseDefaultParams(parseDefaultParamsObj);
		expect(response).toEqual(parseDefaultParamsExpectedResponse);
	});

	it('should throw error when called with null or undefined obj', async () => {
		expect(() => parseDefaultParams(null)).toThrow();
		expect(() => parseDefaultParams(undefined)).toThrow();
	});
});

describe('Test parseAllParams method', () => {
	it('should return correctly parsed object when called with valid routeParams and requestParams', async () => {
		const response = parseAllParams(
			parseAllParamsRouteParams,
			parseAllParamsRequestParams,
		);
		expect(response).toEqual(parseAllParamsExpectedResponse);
	});

	it('should throw error when called with null routeParams or requestParams)', async () => {
		expect(() => parseAllParams(null, parseAllParamsRequestParams)).toThrow();
		expect(() => parseAllParams(parseAllParamsRouteParams, null)).toThrow();
		expect(() => parseAllParams(null, null)).toThrow();
	});

	it('should throw error when called with undefined routeParams or requestParams)', async () => {
		expect(() => parseAllParams(undefined, parseAllParamsRequestParams)).toThrow();
		expect(() => parseAllParams(parseAllParamsRouteParams, undefined)).toThrow();
		expect(() => parseAllParams(undefined, undefined)).toThrow();
	});
});

describe('Test looseSpecParams method', () => {
	it('should return expected object when called with an object having number and boolean keys', async () => {
		const response = looseSpecParams(looseSpecParamsInput);
		expect(response).toEqual(looseSpecParamsExpectedResponse);
	});

	it('should throw error when called with null or undefined)', async () => {
		expect(() => looseSpecParams(null)).toThrow();
		expect(() => looseSpecParams(undefined)).toThrow();
	});
});
