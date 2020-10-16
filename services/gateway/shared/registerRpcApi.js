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
const {
	Utils,
	Constants: { JSON_RPC: { INVALID_PARAMS } },
} = require('lisk-service-framework');

const { MoleculerClientError } = require('moleculer').Errors;
const path = require('path');

const mapper = require('./customMapper');
const { validate } = require('./paramValidator');

const apiMeta = [];

const configureApi = (apiName, apiPrefix) => {
	const transformPath = url => {
		const dropSlash = str => str.replace(/^\//, '');
		const curlyBracketsToColon = str => str.split('{').join(':').replace(/}/g, '');

		return curlyBracketsToColon(dropSlash(url));
	};

	const allMethods = Utils.requireAllJs(path.resolve(__dirname, `../apis/${apiName}/methods`));

	const methods = Object.keys(allMethods).reduce((acc, key) => {
		const method = allMethods[key];
		if (method.version !== '2.0') return { ...acc };
		if (!method.source) return { ...acc };
		if (!method.source.method) return { ...acc };
		if (!method.rpcMethod) return { ...acc };
		return { ...acc, [key]: method };
	}, {});

	const whitelist = Object.keys(methods).reduce((acc, key) => [
		...acc, methods[key].source.method,
	], []);

	const aliases = Object.keys(methods).reduce((acc, key) => ({
		...acc, [`${transformPath(methods[key].rpcMethod)}`]: methods[key].source.method,
	}), {});

	const methodPaths = Object.keys(methods).reduce((acc, key) => ({
		...acc, [`${transformPath(methods[key].rpcMethod)}`]: methods[key],
	}), {});

	const meta = {
		apiPrefix,
		routes: Object.keys(methods).map(m => ({
			path: methods[m].rpcMethod,
			params: Object.keys(methods[m].params || {}),
			response: {
				...methods[m].envelope,
				...methods[m].source.definition,
			},
		})),
	};

	apiMeta.push(meta);

	return { aliases, whitelist, methodPaths };
};

const typeMappings = {
	string_number: (input) => Number(input),
	number_string: (input) => String(input),
	array_string: (input) => input.join(','),
};

const convertType = (item, type) => {
	const typeMatch = `${(typeof item)}_${type}`;
	if (typeMappings[typeMatch]) return typeMappings[typeMatch](item);
	return item;
};

const mapParam = (source, originalKey, mappingKey) => {
	if (mappingKey) {
		if (originalKey === '=') return { key: mappingKey, value: source[mappingKey] };
		return { key: mappingKey, value: source[originalKey] };
	}
	// logger.warn(`ParamsMapper: Missing mapping for the param ${mappingKey}`);
	return {};
};

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

const registerApi = (apiName, config) => {
	const { aliases, whitelist, methodPaths } = configureApi(apiName, config.path);

	const transformRequest = (apiPath, params) => {
		try {
			const paramDef = methodPaths[apiPath].source.params;
			const transformedParams = transformParams(params, paramDef);
			return transformedParams;
		} catch (e) { return params; }
	};

	const transformResponse = async (apiPath, data) => {
		if (!methodPaths[apiPath]) return data;
		const transformedData = await mapper(data, methodPaths[apiPath].source.definition);
		return {
			...methodPaths[apiPath].envelope,
			...transformedData,
		};
	};

	return {
		events: {
			request: {
				...config,

				mappingPolicy: 'restrict',
				whitelist: [
					...config.whitelist,
					...whitelist,
				],
				aliases: {
					...config.aliases,
					...aliases,
				},

				onBeforeCall: async (ctx, socket, request) => {
					const paramReport = validate(request.params, methodPaths[request.method]);

					if (paramReport.missing.length > 0) {
						throw new MoleculerClientError({ code: INVALID_PARAMS[0], message: `Missing parameter(s): ${paramReport.missing.join(', ')}` });
					}

					const unknownList = Object.keys(paramReport.unknown);
					if (unknownList.length > 0) {
						throw new MoleculerClientError({ code: INVALID_PARAMS[0], message: `Unknown input parameter(s): ${unknownList.join(', ')}` });
					}

					const invalidList = paramReport.invalid;
					if (invalidList.length > 0) {
						throw new MoleculerClientError({ code: INVALID_PARAMS[0], message: `Invalid input parameter values: ${invalidList.map(o => o.message).join(', ')}` });
					}

					request.params = transformRequest(request.method, request.params);
				},

				onAfterCall: async (ctx, socket, request, data) => transformResponse(request.method, data),
			},
		},
	};
};

module.exports = registerApi;
