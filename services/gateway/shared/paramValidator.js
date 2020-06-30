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

const getTimestamp = () => Math.floor(Date.now() / 1000);

const mapObjectWithProperty = (obj, propName) => Object.keys(obj).reduce((acc, cur) => {
	if (obj[cur][propName]) acc[cur] = obj[cur][propName];
	return acc;
}, {});

const objDiff = (reference, testedObject) => Object.keys(testedObject).filter(o => typeof reference[o] === 'undefined');
const arrDiff = (arr1, arr2) => arr2.filter(x => !arr1.includes(x));

const parseParams = (p) => {
	const combinedParams = { ...p.swaggerParams, ...p.inputParams };
	const paramsDiff = (allParams, swaggerParams) => allParams.filter(
		item => !swaggerParams.includes(item));
	const invalidParamsList = paramsDiff(Object.keys(combinedParams), Object.keys(p.swaggerParams));
	const invalidParams = invalidParamsList.reduce((acc, val) => {
		acc[val] = p.inputParams[val];
		return acc;
	}, {});

	const validParamsList = Object.keys(p.swaggerParams).filter(o => typeof p.swaggerParams[o] !== 'undefined');
	const validParams = validParamsList.reduce((acc, val) => {
		acc[val] = p.inputParams[val];
		return acc;
	}, {});

	return {
		valid: validParams,
		unknown: invalidParams,
	};
};

const validateInputParams = (inputParams = {}, specs) => {
	const checkMissingParams = (routeParams, requestParams) => {
		const requiredParamList = Object.keys(routeParams)
			.filter(o => routeParams[o].required === true);
		const requestParamList = Object.keys(requestParams);
		return arrDiff(requestParamList, requiredParamList);
	};

	const parseDefaultParams = p => mapObjectWithProperty(p, 'default');

	const parseAllParams = (routeParams, requestParams) => Object.keys(routeParams)
		.reduce((acc, cur) => {
			if (routeParams[cur].default !== undefined) acc[cur] = routeParams[cur].default;
			if (requestParams[cur] !== undefined) acc[cur] = requestParams[cur];
			return acc;
		}, {});

	const specParams = specs.params || {};

	const paramReport = parseParams({
		swaggerParams: parseAllParams(specParams, inputParams),
		inputParams: { ...parseDefaultParams(specParams), ...inputParams },
	});

	paramReport.missing = checkMissingParams(specParams, inputParams);

	if (paramReport.missing.length > 0) return paramReport;
	if (Object.keys(paramReport.unknown) > 0) return paramReport;

	const isAllowedValue = (param, value) => (
		!param.enum || value === undefined
			|| (!Array.isArray(value) && param.enum.includes(value))
			|| (
				param.allowMultiple && Array.isArray(value)
				&& value.filter(v => !param.enum.includes(v)).length === 0
			)
	);

	const getInvalidParamValues = () => (
		Object.entries(paramReport.valid).reduce((accumulator, [key, value]) => ([
			...accumulator,
			...(specParams[key].type !== undefined
					// eslint-disable-next-line valid-typeof
					&& typeof value !== specParams[key].type
				? [`Type of '${key}' is ${typeof value} instead of expected ${specParams[key].type}`]
				: []
			),
			...(specParams[key].max !== undefined
					&& value !== undefined
					&& value > specParams[key].max
				? [`Value of '${key}' bigger than allowed maximum ${specParams[key].max}`]
				: []
			),
			...(specParams[key].min !== undefined
					&& value !== undefined
					&& value < specParams[key].min
				? [`Value of '${key}' smaller than allowed minimum ${specParams[key].min}`]
				: []
			),
			...(!isAllowedValue(specParams[key], value)
				? [`Value of '${key}' is not one of allowed values: ${specParams[key].enum.join(', ')}`]
				: []
			),
			...(specParams[key].minLength
					&& typeof value === 'string'
					&& value.length < specParams[key].minLength
				? [`Length of '${key}' smaller than allowed minimum ${specParams[key].minLength}`]
				: []
			),
		]), [])
	);

	paramReport.invalid = getInvalidParamValues();

	return paramReport;
};

module.exports = {
	validate: validateInputParams,
	objDiff,
	arrDiff,
	getTimestamp,

};
