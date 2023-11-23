/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const Validator = require('fastest-validator');

const validator = new Validator();

const getTimestamp = () => Math.floor(Date.now() / 1000);

const mapObjectWithProperty = (obj, propName) =>
	Object.keys(obj).reduce((acc, cur) => {
		if (typeof obj[cur][propName] !== 'undefined') acc[cur] = obj[cur][propName];
		return acc;
	}, {});

// Returns testedObject keys which are not present in reference
const objDiff = (reference, testedObject) =>
	Object.keys(testedObject).filter(o => typeof reference[o] === 'undefined');

// Returns arr2 items which are not present in arr1
const arrDiff = (arr1, arr2) => arr2.filter(x => !arr1.includes(x));

const dropEmptyProps = p =>
	Object.keys(p).reduce((acc, cur) => {
		if (p[cur] !== '') acc[cur] = p[cur];
		return acc;
	}, {});

const parseParams = p => {
	const combinedParams = { ...p.swaggerParams, ...p.inputParams };
	const paramsDiff = (allParams, swaggerParams) =>
		allParams.filter(item => !swaggerParams.includes(item));
	const invalidParamsList = paramsDiff(Object.keys(combinedParams), Object.keys(p.swaggerParams));
	const invalidParams = invalidParamsList.reduce((acc, val) => {
		acc[val] = p.inputParams[val];
		return acc;
	}, {});

	const validParamsList = Object.keys(p.swaggerParams).filter(
		o => typeof p.swaggerParams[o] !== 'undefined',
	);
	const validParams = validParamsList.reduce((acc, param) => {
		const defaultVal = p.swaggerParams[param];
		const inputVal = p.swaggerParams[param];
		acc[param] =
			Number.isNaN(Number(inputVal)) && !Number.isNaN(Number(defaultVal)) ? defaultVal : inputVal;
		return acc;
	}, {});

	return {
		valid: validParams,
		unknown: invalidParams,
	};
};

// Returns empty array if inputParamKeys matches with only one of the schema paramPairings.
// Otherwise, returns the schema paramPairings
const validateFromParamPairings = (paramsRequired = false, inputParamKeys, paramPairings) => {
	if (!paramsRequired) return [];

	// Remove elements not part of paramPairings
	const filteredInputParamKeys = inputParamKeys.filter(element =>
		paramPairings.some(subArray => subArray.includes(element)),
	);

	return paramPairings.find(
		arr =>
			arr.length === filteredInputParamKeys.length &&
			arr.every(el => filteredInputParamKeys.includes(el)),
	)
		? []
		: paramPairings;
};

// Returns a list of required routeParams which are not present in requestParams
const checkMissingParams = (routeParams, requestParams) => {
	const requiredParamList = Object.keys(routeParams).filter(o => routeParams[o].required === true);
	const requestParamList = Object.keys(requestParams);
	return arrDiff(requestParamList, requiredParamList);
};

const parseDefaultParams = p => mapObjectWithProperty(p, 'default');

// Returns the parsed requestParams which are present in routeParams schema
const parseAllParams = (routeParams, requestParams) =>
	Object.keys(routeParams).reduce((acc, cur) => {
		const paramDatatype = routeParams[cur].type;
		if (routeParams[cur].default !== undefined) acc[cur] = routeParams[cur].default;
		if (requestParams[cur] !== undefined) {
			if (paramDatatype === 'number') {
				acc[cur] = requestParams[cur] === '' ? acc[cur] : Number(requestParams[cur]);
			} else {
				acc[cur] = requestParams[cur];
			}
		}
		return acc;
	}, {});

// Adds convert:true property to number and boolean type specPar elements
const looseSpecParams = specPar =>
	Object.keys(specPar).reduce((acc, cur) => {
		if (specPar[cur].type === 'number' || specPar[cur].type === 'boolean') {
			acc[cur] = { convert: true, ...specPar[cur] };
		} else acc[cur] = specPar[cur];
		return acc;
	}, {});

const validateInputParams = (rawInputParams = {}, specs) => {
	const specParams = specs.params || {};
	const inputParams = rawInputParams;

	const paramPairings = specs.validParamPairings || [];
	const inputParamKeys = Object.getOwnPropertyNames(inputParams);

	const paramReport = parseParams({
		swaggerParams: parseAllParams(specParams, inputParams),
		inputParams: { ...parseDefaultParams(specParams), ...inputParams },
	});

	paramReport.required = validateFromParamPairings(
		specs.paramsRequired,
		inputParamKeys,
		paramPairings,
	);

	paramReport.missing = checkMissingParams(specParams, inputParams);

	if (paramReport.missing.length > 0) return paramReport;
	if (Object.keys(paramReport.unknown).length > 0) return paramReport;
	if (paramReport.required.length) return paramReport;

	paramReport.invalid = validator.validate(
		dropEmptyProps(inputParams),
		looseSpecParams(specParams),
	);
	if (paramReport.invalid === true) paramReport.invalid = [];

	return paramReport;
};

module.exports = {
	validate: validateInputParams,
	objDiff,
	arrDiff,
	getTimestamp,
	dropEmptyProps,

	// For testing
	mapObjectWithProperty,
	parseParams,
	validateFromParamPairings,
	checkMissingParams,
	parseDefaultParams,
	parseAllParams,
	looseSpecParams,
};
