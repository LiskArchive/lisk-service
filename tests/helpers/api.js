/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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

import axios from 'axios';

const handleError = (error, expectedStatusCode) => {
	if (error.response) {
		if (error.response.status !== expectedStatusCode) {
			throw new Error(`Status code: ${error.response.status}
			\n${JSON.stringify(error.response.data, null, 2)}`);
		}
		return error.response.data;
	}
	throw new Error('The request was made but no response was received');
};

const handleResponse = (response, expectedStatusCode = 200) => {
	if (response.status === expectedStatusCode) return response.data;
	throw new Error(`Status code: ${response.response.status}
	\n${JSON.stringify(response.response.data, null, 2)}`);
};

const api = {
	get: (url, expectedStatusCode) => axios.get(url)
		.then(response => handleResponse(response, expectedStatusCode))
		.catch(error => handleError(error, expectedStatusCode)),
	post: (url, data, expectedStatusCode) => axios.post(url, data)
		.then(response => handleResponse(response, expectedStatusCode))
		.catch(error => handleError(error, expectedStatusCode)),
	put: (url, data, expectedStatusCode) => axios.put(url, data)
		.then(response => handleResponse(response, expectedStatusCode))
		.catch(error => handleError(error, expectedStatusCode)),
	patch: (url, data, expectedStatusCode) => axios.patch(url, data)
		.then(response => handleResponse(response, expectedStatusCode))
		.catch(error => handleError(error, expectedStatusCode)),
	del: (url, data, expectedStatusCode) => axios.delete(url, { data })
		.then(response => handleResponse(response, expectedStatusCode))
		.catch(error => handleError(error, expectedStatusCode)),
	request: (config, expectedStatusCode) => axios(config)
		.then(response => handleResponse(response, expectedStatusCode))
		.catch(error => handleError(error, expectedStatusCode)),
};

module.exports = {
	api,
};
