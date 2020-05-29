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
const express = require('express');
const createMiddleware = require('@apidevtools/swagger-express-middleware');
const requireAllLib = require('require-all');
const path = require('path');
const logger = require('./logger')();
const { responseStatus, errorMsg } = require('../services/http');

// Middleware
const notFoundHandler = require('../middleware/notFoundHandler.js');

const badRequestHandler = (req, res) => {
	if (res.headersSent === false) {
		res.status(responseStatus.INVALID_PARAMS.code);
		res.json({
			error: 'Bad request',
			url: req.originalUrl,
		});
	}
};

const notImplementedHandler = (req, res) => {
	if (res.headersSent === false) {
		res.status(responseStatus.NOT_IMPLEMENTED.code);
		res.json({
			error: errorMsg.NOT_IMPLEMENTED,
			url: req.originalUrl,
		});
	}
};

const errorHandler = (err, req, res, next) => {
	if (err.status === responseStatus.NOT_FOUND.code) notFoundHandler(req, res, next);
	else if (err.status === responseStatus.INVALID_PARAMS.code) badRequestHandler(req, res, next);
	else if (err.status === responseStatus.NOT_IMPLEMENTED.code) {
		notImplementedHandler(req, res, next);
	} else {
		next();
	}
};

const requireAll = requirePath => requireAllLib({
	dirname: requirePath,
	filter: /(.+)\.js$/,
	excludeDirs: /^\.(git|svn)$/,
	recursive: false,
});

const stdControllers = requireAll(path.resolve(__dirname, '../controllers'));
const collectors = requireAll(path.resolve(__dirname, '../collectors'));

const registerStandardController = (swaggerApp, swaggerConfig, apiConfig, controllers) => {
	const methods = requireAll(`${swaggerConfig.appRoot}/methods`);

	Object.keys(methods).forEach((methodName) => {
		const method = methods[methodName];
		const httpMethod = method.method || 'GET';

		const swaggerPath = method.swaggerApiPath;
		const expressPath = swaggerPath.split('/')
			.map(item => item.replace(/\{(.+)\}/, ':$1'))
			.join('/');

		if (method.controller) {
			swaggerApp.all('*', (req, res, next) => controllers[method.controller](req, res, next));
		} else if (method.version === '2.0') {
			const allowedMethods = new Set(['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH']);

			if (allowedMethods.has(httpMethod.toUpperCase())) {
				swaggerApp[httpMethod.toLowerCase()](`${apiConfig.apiPath}${expressPath}`,
					async (req, res, next) => controllers.version2(req, res, next, method, collectors));

				logger.info(`Registered ${httpMethod} ${apiConfig.apiPath}${swaggerPath}`);
			} else {
				logger.warn(`Unable to register ${httpMethod} ${apiConfig.apiPath}${swaggerPath}: Method ${httpMethod} is not supported`);
			}
		} else if (method.version === '1.0') {
			swaggerApp[httpMethod.toLowerCase()](`${apiConfig.apiPath}${expressPath}`,
				async (req, res, next) => controllers.version1(req, res, next, method, collectors));
			logger.info(`Registered ${httpMethod} ${apiConfig.apiPath}${swaggerPath} (Version 1.0)`);
		} else {
			logger.warn(`Unsupported method version in ${methodName}`);
		}
	});
};

const registerSwaggerApi = (server, apiConfig, apiInternalConfig) => {
	const swaggerConfig = apiInternalConfig.swagger;
	const swaggerApp = express();

	return new Promise((resolve, reject) => {
		createMiddleware(swaggerConfig.swaggerFile, swaggerApp, (err, middleware) => {
			if (err) {
				reject(err);
			} else {
				swaggerApp.use(
					middleware.metadata(),
					middleware.CORS(),
					middleware.parseRequest(),
					middleware.validateRequest(),
				);

				const controllers = { ...stdControllers, ...requireAll(`${swaggerConfig.appRoot}/controllers`) };

				if (swaggerConfig.customController) {
					swaggerApp.use((req, res, next) =>
						controllers[swaggerConfig.customController](req, res, next));
				} else {
					registerStandardController(swaggerApp, swaggerConfig, apiConfig, controllers);
				}

				swaggerApp.use(errorHandler);

				server.expressApp.use(swaggerApp);
				logger.info(`${apiConfig.description || apiConfig.name} registered`);
				resolve(swaggerApp);
			}
		});
	});
};

module.exports = registerSwaggerApi;
