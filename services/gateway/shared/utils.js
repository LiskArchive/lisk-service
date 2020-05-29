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
const logger = require('./logger')();

const getTimestamp = () => Math.floor(Date.now() / 1000);

const parseSwaggerParams = params => params.reduce((acc, cur) => {
	acc[cur.name] = cur.type;
	return acc;
}, {});

const mapParam = (source, originalKey, mappingKey) => {
	if (mappingKey) {
		if (originalKey === '=') return { key: mappingKey, value: source[mappingKey] };
		return { key: mappingKey, value: source[originalKey] };
	}
	logger.warn(`ParamsMapper: Missing mapping for the param ${mappingKey}`);
	return {};
};

const rewriteRequestPath = (apiPath, params) => apiPath.replace(/{[A-z0-9]+}/g, (match) => {
	const trimParentheses = s => (s.substring(1, s.length - 1));
	const paramName = trimParentheses(match);
	return params[paramName];
});

const filterRequestParams = (apiPath, params) => {
	const pathParams = (apiPath.match(/{[A-z0-9]+}/g) || []).map(s => (s.substring(1, s.length - 1)));
	const pathParamsSet = new Set(pathParams);
	const apiParamsSet = new Set(Object.keys(params));
	const difference = new Set([...apiParamsSet].filter(x => !pathParamsSet.has(x)));
	return [...difference].reduce((acc, val) => { acc[val] = params[val]; return acc; }, {});
};

const transformParams = (params, specs) => {
	const output = {};
	Object.keys(specs).forEach((specParam) => {
		const result = mapParam(params, specs[specParam], specParam);
		if (result.key) output[result.key] = result.value;
	});
	return output;
};

const mapObjectWithProperty = (obj, propName) => Object.keys(obj).reduce((acc, cur) => {
	if (obj[cur][propName]) acc[cur] = obj[cur][propName];
	return acc;
}, {});

const objDiff = (reference, testedObject) => Object.keys(testedObject).filter(o => typeof reference[o] === 'undefined');
const arrDiff = (arr1, arr2) => arr2.filter(x => !arr1.includes(x));

const parseParams = (p) => {
	const combinedParams = Object.assign({}, p.swaggerParams, p.inputParams);
	const paramsDiff = (allParams, swaggerParams) =>
		allParams.filter(item => !swaggerParams.includes(item));
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
		invalid: invalidParams,
	};
};

module.exports = {
	parseSwaggerParams,
	mapParam,
	rewriteRequestPath,
	filterRequestParams,
	transformParams,
	objDiff,
	arrDiff,
	parseParams,
	mapObjectWithProperty,
	getTimestamp,
};
