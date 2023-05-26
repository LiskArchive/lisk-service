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
	HTTP: { StatusCodes },
	Constants: { HTTP: { INVALID_REQUEST } },
	Exceptions: { ValidationException },
	Logger,
} = require('lisk-service-framework');

const path = require('path');
const gatewayConfig = require('../config');
const { transformPath, transformRequest, transformResponse } = require('./apiUtils');
const { validate, dropEmptyProps } = require('./paramValidator');

const logger = Logger();
const apiMeta = [];

const getMethodName = method => method.httpMethod ? method.httpMethod : 'GET';

const configureApi = (apiPrefix, methods, useFalseEtag = false) => {
	const whitelist = Object.keys(methods).reduce((acc, key) => [
		...acc, methods[key].source.method,
	], []);

	const aliases = Object.keys(methods).reduce((acc, key) => ({
		...acc, [`${getMethodName(methods[key])} ${useFalseEtag ? '/' : transformPath(methods[key].swaggerApiPath)}`]: methods[key].source.method,
	}), {});

	const methodPaths = Object.keys(methods).reduce((acc, key) => ({
		...acc, [`${getMethodName(methods[key])} ${useFalseEtag ? '' : transformPath(methods[key].swaggerApiPath)}`]: methods[key],
	}), {});

	const meta = {
		apiPrefix,
		routes: Object.keys(methods).map(m => ({
			path: methods[m].swaggerApiPath,
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

const getAllAPIs = (apiNames, registeredModuleNames) => {
	const allMethods = {};
	// Populate allMethods from the js files under apis directory
	if (typeof apiNames === 'string') apiNames = [apiNames];
	apiNames.forEach(apiName => {
		// Assign common endpoints
		Object.assign(
			allMethods,
			Utils.requireAllJs(path.resolve(__dirname, `../apis/${apiName}/methods`)),
		);
		// Assign registered application module specific endpoints
		registeredModuleNames.forEach(moduleName => {
			const dirPath = `../apis/${apiName}/methods/modules/${moduleName}`;
			try {
				Object.assign(
					allMethods,
					Utils.requireAllJs(path.resolve(__dirname, dirPath)),
				);
			} catch (err) {
				logger.warn(`Moleculer method definitions (HTTP endpoints) missing for module: ${module}. Is this expected?\nWas expected at: ${dirPath}.`);
			}
		});
	});

	const methods = Object.keys(allMethods).reduce((acc, key) => {
		const method = allMethods[key];
		if (method.version !== '2.0') return { ...acc };
		if (!method.source) return { ...acc };
		if (!method.source.method) return { ...acc };
		if (!method.swaggerApiPath) return { ...acc };
		return { ...acc, [key]: method };
	}, {});

	return methods;
};

const getAPIConfig = (configPath, config, aliases, whitelist, methodPaths, etag) => ({
	...config,

	path: configPath,

	whitelist: [
		...config.whitelist,
		...whitelist,
	],

	aliases: {
		...config.aliases,
		...aliases,
	},

	etag: (etag === undefined || etag === 'strong') ? 'strong' : false,

	async onBeforeCall(ctx, route, req, res) {
		const sendResponse = (code, message) => {
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(code || 400);
			res.end(JSON.stringify({
				error: true,
				message,
			}));
		};

		const routeAlias = `${req.method.toUpperCase()} ${req.$alias.path}`;
		const paramReport = validate(req.$params, methodPaths[routeAlias]);

		if (paramReport.missing.length > 0) {
			sendResponse(INVALID_REQUEST[0], `Missing parameter(s): ${paramReport.missing.join('; ')}`);
			throw new ValidationException('Request param validation error.');
		}

		const unknownList = Object.keys(paramReport.unknown);
		if (unknownList.length > 0) {
			sendResponse(INVALID_REQUEST[0], `Unknown input parameter(s): ${unknownList.join('; ')}`);
			throw new ValidationException('Request param validation error.');
		}

		if (paramReport.required.length) {
			sendResponse(INVALID_REQUEST[0], `Require one of the following parameter combination(s): ${paramReport.required.join('; ')}`);
			throw new ValidationException('Request param validation error.');
		}

		const invalidList = paramReport.invalid;
		if (invalidList.length > 0) {
			sendResponse(INVALID_REQUEST[0], `Invalid input: ${invalidList.map(o => o.message).join('; ')}`);
			throw new ValidationException('Request param validation error.');
		}

		const params = transformRequest(methodPaths[routeAlias], dropEmptyProps(paramReport.valid));
		req.$params = params;
	},

	async onAfterCall(ctx, route, req, res, data) {
		if (gatewayConfig.api.enableHttpCacheControl) {
			// Set 'Cache-Control' to assist response caching
			ctx.meta.$responseHeaders = { 'Cache-Control': gatewayConfig.api.httpCacheControlDirectives };
		}

		// Set response headers and return CSV data if filename available
		if (data.data && data.meta && data.meta.filename && data.meta.filename.endsWith('.csv')) {
			res.setHeader('Content-Disposition', `attachment; filename="${data.meta.filename}"`);
			res.setHeader('Content-Type', 'text/csv');
			res.end(data.data);
			return res;
		}

		if (data.data && data.status) {
			if (data.status === 'SERVICE_UNAVAILABLE') ctx.meta.$responseHeaders = { 'Retry-After': 30 };
			if (data.status === 'INVALID_PARAMS') data.status = 'BAD_REQUEST';

			ctx.meta.$statusCode = StatusCodes[data.status] || data.status;

			// 'ACCEPTED' is a successful HTTP code
			if (data.status !== 'ACCEPTED') {
				let message = `The request ended up with ${data.status} error`;

				if (typeof data.data === 'object' && typeof data.data.error === 'string') {
					message = data.data.error;
				}

				return {
					error: true,
					message,
				};
			}
		}
		const apiPath = `${req.method.toUpperCase()} ${req.$alias.path}`;
		return transformResponse(methodPaths[apiPath], data);
	},
});

const registerApi = (apiNames, config, registeredModuleNames) => {
	const allAPIs = getAllAPIs(apiNames, registeredModuleNames);

	const falseEtagAPIs = Object.fromEntries(Object.entries(allAPIs)
		.filter(([, value]) => value.etag !== undefined && !value.etag));
	const strongEtagAPIs = Object.fromEntries(Object.entries(allAPIs)
		.filter(([, value]) => value.etag === undefined || value.etag === 'strong'));

	const apisToRegister = [];

	const strongEtagAPIConfig = configureApi(
		config.path,
		strongEtagAPIs,
	);

	// Build config for etag == strong
	apisToRegister.push(getAPIConfig(config.path, config, strongEtagAPIConfig.aliases, strongEtagAPIConfig.whitelist, strongEtagAPIConfig.methodPaths, 'strong'));

	// Build config for etag == false
	// eslint-disable-next-line no-restricted-syntax
	for (const key of Object.keys(falseEtagAPIs)) {
		const falseEtagAPIConfig = configureApi(
			config.path,
			{ key: falseEtagAPIs[key] },
			true,
		);

		apisToRegister.push(getAPIConfig(`${config.path}${falseEtagAPIs[key].swaggerApiPath}`, config, falseEtagAPIConfig.aliases, falseEtagAPIConfig.whitelist, falseEtagAPIConfig.methodPaths, 'false'));
	}

	return apisToRegister;
};

module.exports = {
	registerApi,

	// For testing
	getMethodName,
	configureApi,
};
