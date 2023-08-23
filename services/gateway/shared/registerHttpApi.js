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
const path = require('path');
const {
	Utils,
	HTTP: { StatusCodes },
	Exceptions: { ValidationException },
	Logger,
} = require('lisk-service-framework');

const gatewayConfig = require('../config');
const { transformPath, transformRequest, transformResponse } = require('./apiUtils');
const { validate, dropEmptyProps } = require('./paramValidator');

const logger = Logger();

const DEFAULT_ALIAS = '/';
const DEFAULT_METHOD_PATH = '';
const DEFAULT_ETAG_VALUE = 'strong';
const ALLOWED_ETAG_VALUES = ['strong', 'weak', true, false, 'custom'];

const getMethodName = method => method.httpMethod ? method.httpMethod : 'GET';

const buildAPIAliases = (apiPrefix, methods, eTag = DEFAULT_ETAG_VALUE) => {
	const whitelist = Object.keys(methods).reduce((acc, key) => [
		...acc, methods[key].source.method,
	], []);

	const aliases = Object.keys(methods).reduce((acc, key) => ({
		...acc, [`${getMethodName(methods[key])} ${eTag === DEFAULT_ETAG_VALUE ? transformPath(methods[key].swaggerApiPath) : DEFAULT_ALIAS}`]: methods[key].source.method,
	}), {});

	const methodPaths = Object.keys(methods).reduce((acc, key) => ({
		...acc, [`${getMethodName(methods[key])} ${eTag === DEFAULT_ETAG_VALUE ? transformPath(methods[key].swaggerApiPath) : DEFAULT_METHOD_PATH}`]: methods[key],
	}), {});

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

/* eslint-disable-next-line max-len */
const buildAPIConfig = (configPath, config, aliases, whitelist, methodPaths, eTag = DEFAULT_ETAG_VALUE) => ({
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

	etag: (typeof eTag === 'function') ? eTag() : eTag,

	// eslint-disable-next-line no-unused-vars
	async onBeforeCall(ctx, route, req, res) {
		const routeAlias = `${req.method.toUpperCase()} ${req.$alias.path}`;
		const paramReport = validate(req.$params, methodPaths[routeAlias]);

		if (paramReport.missing.length > 0) {
			throw new ValidationException(`Missing parameter(s): ${paramReport.missing.join('; ')}`);
		}

		const unknownList = Object.keys(paramReport.unknown);
		if (unknownList.length > 0) {
			throw new ValidationException(`Unknown input parameter(s): ${unknownList.join('; ')}`);
		}

		if (paramReport.required.length) {
			throw new ValidationException(`Require one of the following parameter combination(s): ${paramReport.required.join('; ')}`);
		}

		const invalidList = paramReport.invalid;
		if (invalidList.length > 0) {
			throw new ValidationException(`Invalid input: ${invalidList.map(o => o.message).join('; ')}`);
		}

		const params = transformRequest(methodPaths[routeAlias], dropEmptyProps(paramReport.valid));
		req.$params = params;
	},

	async onAfterCall(ctx, route, req, res, data) {
		if (gatewayConfig.api.enableHttpCacheControl) {
			// Set 'Cache-Control' to assist response caching
			ctx.meta.$responseHeaders = { 'Cache-Control': gatewayConfig.api.httpCacheControlDirectives };
		}

		// Set response headers and return excel or CSV data if filename available
		if (data.data && data.meta && data.meta.filename) {
			res.setHeader('Content-Disposition', `attachment; filename="${data.meta.filename}"`);
			if (data.meta.filename.endsWith('.xlsx') || data.meta.filename.endsWith('.xls')) {
				res.setHeader('Content-Type', 'application/vnd.ms-excel');
				res.end(Buffer.from(data.data, 'hex'));
			} else if (data.meta.filename.endsWith('.csv')) {
				res.setHeader('Content-Type', 'text/csv');
				res.end(data.data);
			}
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

	const apisToRegister = [];

	// eslint-disable-next-line no-restricted-syntax
	for (const eTagVal of ALLOWED_ETAG_VALUES) {
		const eTagAPIs = Object.fromEntries(Object.entries(allAPIs)
			.filter(([, value]) => {
				if (value.eTag === undefined) value.eTag = DEFAULT_ETAG_VALUE;
				return (eTagVal === 'custom' && typeof value.eTag === 'function') || value.eTag === eTagVal;
			}));

		// Build a common config for eTag == DEFAULT_ETAG_VALUE APIs
		if (eTagVal === DEFAULT_ETAG_VALUE) {
			const etagAPIsConfig = buildAPIAliases(
				config.path,
				eTagAPIs,
				DEFAULT_ETAG_VALUE,
			);

			apisToRegister.push(buildAPIConfig(config.path, config, etagAPIsConfig.aliases,
				etagAPIsConfig.whitelist, etagAPIsConfig.methodPaths, DEFAULT_ETAG_VALUE));
		} else {
			// eslint-disable-next-line no-restricted-syntax
			for (const key of Object.keys(eTagAPIs)) {
				const etagAPIsConfig = buildAPIAliases(config.path, { key: eTagAPIs[key] }, true);
				apisToRegister.push(buildAPIConfig(`${config.path}${eTagAPIs[key].swaggerApiPath}`, config, etagAPIsConfig.aliases, etagAPIsConfig.whitelist, etagAPIsConfig.methodPaths, eTagAPIs[key].eTag));
			}
		}
	}

	return apisToRegister;
};

module.exports = {
	registerApi,

	// For testing
	getMethodName,
	buildAPIAliases,
	getAllAPIs,
	buildAPIConfig,
};
