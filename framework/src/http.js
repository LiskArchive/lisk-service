/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const axios = require('axios');
const HttpStatus = require('http-status-codes');
const debug = require('debug')('http');
const util = require('util');

const delay = require('./delay');

const CACHE_MAX_N_ITEMS = 4096;
const CACHE_MAX_TTL = 12 * 60 * 60 * 1000; // 12 hrs

const CacheLRU = require('./cacheLru');

const cache = CacheLRU('_framework_http_cache', {
	max: CACHE_MAX_N_ITEMS,
	ttl: CACHE_MAX_TTL,
});

const _validateHttpResponse = response => {
	if (response.status === HttpStatus.OK) return true;
	return false;
};

const performRequest = async (url, params) => {
	try {
		debug(`Attempting to retrieve data from ${url} ${util.inspect(params)}`);
		const response = await axios({ url, ...params });
		return response;
	} catch (err) {
		if (err.response) {
			return {
				...err.response,
				message: err.message,
			};
		}
		return {
			status: err.code,
			message: err.message,
		};
	}
};

const performRequestUntilSuccess = async (url, params) => {
	let retries = params.retries || 0;
	let response;

	do {
		/* eslint-disable no-await-in-loop */
		response = await performRequest(url, params);
		const firstErrorCoreDigit = response.status.toString()[0];
		if (firstErrorCoreDigit === '1') return response;
		if (firstErrorCoreDigit === '2') return response;
		if (firstErrorCoreDigit === '3') return response;

		--retries;
		await delay(params.retryDelay || 100);
		/* eslint-enable no-await-in-loop */
	} while (retries > 0);

	return response;
};

const request = async (url, params = {}) => {
	let response;
	let key;

	const httpParams = { ...params };
	delete httpParams.cacheTTL;

	if (!httpParams.method) httpParams.method = 'get';

	if (httpParams.method.toLowerCase() === 'get'
		&& params.cacheTTL && params.cacheTTL > 0) {
		key = `${encodeURI(url)}:ttl=${params.cacheTTL}`;
		response = await cache.get(key);
	}

	if (!response) {
		const httpResponse = await performRequestUntilSuccess(url, httpParams);

		if (_validateHttpResponse(httpResponse)) {
			const { data, headers, status, statusText } = httpResponse;
			response = { data, headers, status, statusText };

			if (key) cache.set(key, response, params.cacheTTL);
		}
	}

	return response;
};

module.exports = {
	request,
	get: (url, params) => request(url, { ...params, method: 'get' }),
	head: (url, params) => request(url, { ...params, method: 'head' }),
	post: (url, params) => request(url, { data: { ...params }, method: 'post' }),
	put: (url, params) => request(url, { data: { ...params }, method: 'put' }),
	delete: (url, params) => request(url, { ...params, method: 'delete' }),
	connect: (url, params) => request(url, { ...params, method: 'connect' }),
	options: (url, params) => request(url, { ...params, method: 'options' }),
	trace: (url, params) => request(url, { ...params, method: 'trace' }),
	StatusCodes: HttpStatus,
	_destroyCache: () => cache.destroy(),
};
