import axios from 'axios';


const handleError = (error, expectedStatusCode) => {
	if (error.response) {
		if (error.response.status !== expectedStatusCode) {
			throw new Error(`Status code: ${error.response.status} 
			\n${JSON.stringify(error.response.data, null, 2)}`);
		}
	} else {
		throw new Error('The request was made but no response was received');
	}
	return error.response.data;
};

const api = {
	get: (url, expectedStatusCode) => axios.get(url)
		.then(response => response.data)
		.catch(error => handleError(error, expectedStatusCode)),
	put: (url, data, expectedStatusCode) => axios.put(url, data)
		.then(response => response.data)
		.catch(error => handleError(error, expectedStatusCode)),
	del: (url, expectedStatusCode) => axios.delete(url)
		.then(response => response.data)
		.catch(error => handleError(error, expectedStatusCode)),
	request: (config, expectedStatusCode) => axios(config)
		.then(response => response.data)
		.catch(error => handleError(error, expectedStatusCode)),
};

export default api;
