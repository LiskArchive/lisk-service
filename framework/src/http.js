const axios = require('axios');
const HttpStatus = require('http-status-codes');

const delay = require('./delay');

const CACHE_DEFAULT_TTL = 0;
const CACHE_MAX_N_ITEMS = 4096;
const CACHE_MAX_TTL = 12 * 60 * 60 * 1000; // 12 hrs

const cache = require('./cacheLru')('_framework_http_cache', {
	max: CACHE_MAX_N_ITEMS,
	ttl: CACHE_MAX_TTL,
});

const _validateHttpResponse = (response) => {
	if (response.status === HttpStatus.OK) return true;
	return false;
};

const request = async (url, params = {}) => {
	let response;
	const key = url + JSON.stringify(params);

	if (params.cacheTTL && params.cacheTTL > 0) {
		response = await cache.get(key);
	}

	if (!response) {
		response = await performRequestUntilSuccess(
			url, 
			params);
		if(_validateHttpResponse(response)) {
			cache.set(key, response, params.cacheTTL || CACHE_DEFAULT_TTL);
		}
	}

	return response;
};

const performRequest = async (url, params) => {
	try {
		const response = await axios({ url, ...params });
		return response;
	} catch(err) {
		if (err.response) {
			return {
				...err.response,
				message: err.message,
			};
		} else {
			return {
				status: err.code,
				message: err.message,
			};
		}
	}
};

const performRequestUntilSuccess = async (url, params) => {
	let retries = params.retries || 0;
	let response;
	do {
		response = await performRequest(url, params);
		const firstErrorCoreDigit = response.status.toString()[0];
		if (firstErrorCoreDigit === '1') return response;
		if (firstErrorCoreDigit === '2') return response;
		if (firstErrorCoreDigit === '3') return response;

		--retries;
		await delay(params.retryDelay || 100);
	} while(retries > 0);

	return response;
}

const requestWithPagination = async (fn, params, limit) => {
	const defaultMaxAmount = limit || 1000;
	const oneRequestLimit = params.limit || 100;
	const firstRequest = await fn(Object.assign({}, params, {
		limit: oneRequestLimit,
		offset: 0,
	}));
	const data = firstRequest.data;
	const maxAmount = firstRequest.meta.count > defaultMaxAmount
		? defaultMaxAmount
		: firstRequest.meta.count;

	if (maxAmount > oneRequestLimit) {
		const pages = [...Array(Math.ceil(maxAmount / oneRequestLimit)).keys()];
		pages.shift();

		const collection = await pages.reduce((promise, page) => promise.then(() => fn(
			Object.assign({}, params, {
				limit: oneRequestLimit,
				offset: oneRequestLimit * page,
			}))).then((result) => {
			result.data.forEach((item) => { data.push(item); });
			return data;
		}).catch(err => {
			logger.warn(`Failed to fetch data ${err}`);
		}), Promise.resolve());
		return collection;
	}
	return data;
};

module.exports = {
	request,
	// get,
	// head,
	// post,
	// put,
	// 'delete': httpDelete,
	// connect,
	// options,
	// trace,
	StatusCodes: HttpStatus,
};
