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
// eslint-disable-next-line import/no-extraneous-dependencies
const requireAll = require('require-all');
const path = require('path');
const BluebirdPromise = require('bluebird');

/* eslint-disable import/no-unresolved */
const utils = require('../../services/utils');
const MapperService = require('../../services/mapper');
const errorCodesDef = require('./errorCodes').JSON_RPC;
const cachedPromise = require('../../services/cachedPromise');

const logger = require('../../services/logger')();
const trafficLogger = require('../../services/logger')('json-rpc-traffic');
/* eslint-enable import/no-unresolved */

const MULTI_REQUEST_CONCURRENCY = 16;

const controllers = requireAll({
	dirname: path.resolve(__dirname, '../../collectors'),
	filter: /(.+)\.js$/,
	excludeDirs: /^\.(git|svn)$/,
	recursive: false,
});

const routes = requireAll({
	dirname: path.resolve(__dirname, './methods'),
	filter: /(.+)\.js$/,
	excludeDirs: /^\.(git|svn)$/,
	recursive: false,
});

const rpcRoutes = {};

const successResponse = (id, result) => ({
	jsonrpc: '2.0',
	id,
	result,
});

const errorResponse = (code, message) => ({
	jsonrpc: '2.0',
	id: null,
	error: { code, message },
});

const errorCodes = Object.keys(errorCodesDef).reduce((acc, val) => {
	[acc[val]] = errorCodesDef[val];
	return acc;
}, {});

const performClientRequest = async (id, request) => {
	request.params = request.params || {};
	const route = rpcRoutes[request.method];

	if (!route) {
		return errorResponse(
			errorCodes.METHOD_NOT_FOUND, `Invalid method: ${request.method}`);
	}

	const checkMissingParams = (routeParams, requestParams) => {
		const requiredParamList = Object.keys(routeParams)
			.filter(o => routeParams[o].required === true);
		const requestParamList = Object.keys(requestParams);
		return utils.arrDiff(requestParamList, requiredParamList);
	};

	const missingParams = checkMissingParams(route.params, request.params);

	if (missingParams.length > 0) {
		return errorResponse(
			errorCodes.INVALID_PARAMS, `Missing param(s): ${missingParams.join(', ')}`);
	}

	const parseDefaultParams = p => utils.mapObjectWithProperty(p, 'default');

	const parseAllParams = (routeParams, requestParams) => Object.keys(routeParams)
		.reduce((acc, cur) => {
			if (routeParams[cur].default !== undefined) acc[cur] = routeParams[cur].default;
			if (requestParams[cur] !== undefined) acc[cur] = requestParams[cur];
			return acc;
		}, {});

	const params = utils.parseParams({
		swaggerParams: parseAllParams(route.params, request.params),
		inputParams: { ...parseDefaultParams(route.params), ...request.params },
	});

	if (Object.keys(params.invalid).length > 0) {
		const message = `Wrong input parameters: ${Object.keys(params.invalid).join(', ')}`;
		logger.debug(message);
		return errorResponse(errorCodes.INVALID_PARAMS, message);
	}

	const isAllowedValue = (param, value) => (
		!param.enum || value === undefined
		|| (!Array.isArray(value) && param.enum.includes(value))
		|| (
			param.allowMultiple && Array.isArray(value)
			&& value.filter(v => !param.enum.includes(v)).length === 0
		)
	);

	const getInvalidParamValues = () => (
		Object.entries(params.valid).reduce((accumulator, [key, value]) => ([
			...accumulator,
			...(route.params[key].type !== undefined
				// eslint-disable-next-line valid-typeof
				&& typeof value !== route.params[key].type
				? [`Type of '${key}' is ${typeof value} instead of expected ${route.params[key].type}`]
				: []
			),
			...(route.params[key].max !== undefined
				&& value !== undefined
				&& value > route.params[key].max
				? [`Value of '${key}' bigger than allowed maximum ${route.params[key].max}`]
				: []
			),
			...(route.params[key].min !== undefined
				&& value !== undefined
				&& value < route.params[key].min
				? [`Value of '${key}' smaller than allowed minimum ${route.params[key].min}`]
				: []
			),
			...(!isAllowedValue(route.params[key], value)
				? [`Value of '${key}' is not one of allowed values: ${route.params[key].enum.join(', ')}`]
				: []
			),
			...(route.params[key].minLength
				&& typeof value === 'string'
				&& value.length < route.params[key].minLength
				? [`Length of '${key}' smaller than allowed minimum ${route.params[key].minLength}`]
				: []
			),
		]), [])
	);
	const invalidParamValues = getInvalidParamValues();

	if (invalidParamValues.length > 0) {
		const message = `Wrong input parameter values: ${invalidParamValues.join(', ')}`;
		logger.debug(message);
		return errorResponse(errorCodes.INVALID_PARAMS, message);
	}

	const source = Array.isArray(route.source) ? route.source[0] : route.source;
	let json;

	try {
		if (controllers[source.type]) {
			json = await cachedPromise({
				method: controllers[source.type],
				args: [
					route.method,
					source,
					params.valid || {},
				],
				ttl: route.ttl,
			});
		} else {
			logger.error(`Unsupported source for ${source.type}.`);
			return errorResponse(errorCodes.SERVER_ERROR, `Unsupported source for ${source.type}.`);
		}
	} catch (err) {
		if (err.code === 'NOT_FOUND') json = {};
		else {
			logger.error(`${err.code}: ${err.message}`);
			return errorResponse(errorCodes.SERVER_ERROR, 'Error during data fetch.');
		}
	}

	let result;
	try {
		const transformedResult = MapperService(json, source.definition);
		result = Object.entries(json).length === 0
			? json
			: ({ ...route.envelope, ...transformedResult });
	} catch (err) {
		logger.error(err.message);
		return errorResponse(errorCodes.SERVER_ERROR, 'Server error, failed on transforming.');
	}

	return successResponse(id, result);
};

const registerCustomSocketApis = async socket => {
	Object.keys(routes).forEach(routeName => {
		const route = routes[routeName];
		try {
			rpcRoutes[route.method] = route;
			rpcRoutes[route.method].routeName = routeName;
			logger.info(`Registering WebSocket request ${route.method}`);
		} catch (err) {
			logger.warn(`Failed to register WebSocket endpoint: ${route.method}: ${err.message}`);
		}
	});

	socket.on('connection', clientSocket => {
		const ipAddress = clientSocket.handshake.address.split(':')[3];
		clientSocket.on('request', async (requests, answerCb = () => { }) => {
			if (!requests) answerCb(errorResponse(errorCodes.INVALID_PARAMS, 'No request params are passed'));

			let singleResponse = false;
			if (!Array.isArray(requests)) {
				singleResponse = true;
				requests = [requests];
			}

			const responses = await BluebirdPromise.map(requests, async request => {
				const id = request.id || (requests.indexOf(request)) + 1;
				const response = await performClientRequest(id, request);
				trafficLogger.info(`${ipAddress} ${request.method} ${JSON.stringify(request.params)}`);
				if (response.error) {
					trafficLogger.warn(`${response.error.code} ${response.error.message}`);
				}
				return response;
			}, { concurrency: MULTI_REQUEST_CONCURRENCY });

			if (singleResponse) answerCb(responses[0]);
			else answerCb(responses);
		});
	});
};

module.exports = registerCustomSocketApis;
