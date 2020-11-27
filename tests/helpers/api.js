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
	put: (url, data, expectedStatusCode) => axios.put(url, data)
		.then(response => handleResponse(response, expectedStatusCode))
		.catch(error => handleError(error, expectedStatusCode)),
	del: (url, expectedStatusCode) => axios.delete(url)
		.then(response => handleResponse(response, expectedStatusCode))
		.catch(error => handleError(error, expectedStatusCode)),
	request: (config, expectedStatusCode) => axios(config)
		.then(response => handleResponse(response, expectedStatusCode))
		.catch(error => handleError(error, expectedStatusCode)),
};

module.exports = {
	api,
};
