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
const util = require('util');

const logger = require('../services/logger')();
const http = require('../services/http').request;
const config = require('../config');
const utils = require('../services/utils');

const endpoints = config.endpoints;

const httpClientTimeout = 10 * 1000; // ms

const httpRequest = (endpoint, path, params) => new Promise((resolve, reject) => {
	if (!endpoints[endpoint]) {
		const message = `Endpoint not defined: ${endpoint}`;
		logger.warn(message);
		return reject({
			code: 'SERVER_ERROR',
			message,
		});
	}

	const request = {
		path: `${config.endpoints[endpoint].url}${path}`,
		params,
	};

	http({
		url: request.path,
		qs: request.params,
		timeout: httpClientTimeout,
	}).then((data) => {
		try {
			return resolve(JSON.parse(data));
		} catch (err) {
			return reject({
				code: 'SERVICE_UNAVAILABLE',
				message: 'Could not parse the response from remote server',
			});
		}
	}).catch((err) => {
		if (err.statusCode === 404) {
			return reject({
				code: 'NOT_FOUND',
				message: 'Item not found',
			});
		}

		const message = `Error during http request: ${err.message}`;
		logger.debug(message);

		return reject({
			code: 'SERVER_ERROR',
			message,
		});
	});

	return undefined; // to satisfy eslint
});

const performRequest = (method, source, params) => new Promise(async (resolve, reject) => {
	const definition = source.params;
	const transformedParams = utils.transformParams(params, definition);

	logger.debug(`Requesting ${method} from ${source.endpoint}, ${source.path}, with params ${util.inspect(params) || {}}`);

	try {
		const json = await httpRequest(
			source.endpoint,
			utils.rewriteRequestPath(source.path, transformedParams),
			utils.filterRequestParams(source.path, transformedParams));
		logger.debug(`Received data from ${method} from ${source.endpoint}, ${source.path}`);
		return resolve(json);
	} catch (err) {
		return reject(err);
	}
});

module.exports = performRequest;
