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
const mapper = require('./customMapper');

const dropOneSlashAtBeginning = str => str.replace(/^\//, '');
const curlyBracketsToColon = str => str.split('{').join(':').replace(/}/g, '');
const transformPath = url => curlyBracketsToColon(dropOneSlashAtBeginning(url));

const typeMappings = {
	string_number: (input) => Number(input),
	number_string: (input) => String(input),
	array_string: (input) => input.join(','),
	string_boolean: (input) => String(input).toLowerCase() === 'true',
};

const convertType = (item, toType) => {
	const fromType = typeof item === 'object' && item.constructor.name === 'Array' ? 'array' : typeof item;
	const typeMatch = `${fromType}_${toType}`;
	if (typeMappings[typeMatch]) return typeMappings[typeMatch](item);
	return item;
};

// Returns an object with mappingKey as key
const mapParam = (source, originalKey, mappingKey) => {
	if (mappingKey) {
		if (originalKey === '=') return { key: mappingKey, value: source[mappingKey] };
		return { key: mappingKey, value: source[originalKey] };
	}
	return {};
};

// Returns an object with mappingKey as key and type-casted value
const mapParamWithType = (source, originalSetup, mappingKey) => {
	const [originalKey, type] = originalSetup.split(',');
	const mapObject = mapParam(source, originalKey, mappingKey);
	if (typeof type === 'string') return { key: mappingKey, value: convertType(mapObject.value, type) };
	return mapObject;
};

const transformParams = (params = {}, specs) => {
	const output = {};
	Object.keys(specs).forEach((specParam) => {
		const result = mapParamWithType(params, specs[specParam], specParam);
		if (result.key) output[result.key] = result.value;
	});
	return output;
};

const transformRequest = (methodDef, params) => {
	try {
		const paramDef = methodDef.source.params;
		const transformedParams = transformParams(params, paramDef);
		return transformedParams;
	} catch (e) { return params; }
};

const transformResponse = async (methodDef, data) => {
	if (!methodDef) return data;
	const transformedData = await mapper(data, methodDef.source.definition);
	return {
		...methodDef.envelope,
		...transformedData,
	};
};

module.exports = {
	transformParams,
	transformRequest,
	transformResponse,

	// Testing
	convertType,
	dropOneSlashAtBeginning,
	curlyBracketsToColon,
	transformPath,
	mapParam,
	mapParamWithType,
};
