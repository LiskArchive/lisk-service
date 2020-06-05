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
const { mapper, Utils } = require('lisk-service-framework');
const path = require('path');

const configureApi = apiName => {
	const transformPath = url => {
		const dropSlash = str => str.replace(/^\//, '');
		const curlyBracketsToColon = str => str.split('{').join(':').replace(/}/g, '');

		return curlyBracketsToColon(dropSlash(url));
	};

	const allMethods = Utils.requireAllJs(path.resolve(__dirname, `../apis/${apiName}/methods`));

	const methods = Object.keys(allMethods).reduce((acc, key) => {
		const method = allMethods[key];
		if (method.version !== '2.0') return { ...acc };
		if (!method.source) return { ...acc };
		if (!method.source.method) return { ...acc };
		if (!method.swaggerApiPath) return { ...acc };
		return { ...acc, [key]: method };
	}, {});

	const methodPaths = Object.keys(methods).reduce((acc, key) => ({
		...acc, [methods[key].swaggerApiPath]: methods[key],
	}), {});

	const whitelist = Object.keys(methods).reduce((acc, key) => [
		...acc, methods[key].source.method,
	], []);

	const getMethodName = method => method.httpMethod ? method.httpMethod : 'GET';

	const aliases = Object.keys(methods).reduce((acc, key) => ({
		...acc, [`${getMethodName(methods[key])} ${transformPath(methods[key].swaggerApiPath)}`]: methods[key].source.method,
	}), {});

	return { aliases, whitelist, methodPaths };
};

const registerApi = (apiName, config) => {
	const { aliases, whitelist, methodPaths } = configureApi(apiName);

	const transformResponse = async (apiPath, data) => {
		if (!methodPaths[apiPath]) return data;
		const transformedData = await mapper(data.data, methodPaths[apiPath].source.definition);
		return {
			...methodPaths[apiPath].envelope,
			...transformedData,
		};
	};

	return {
		...config,

		whitelist: [
			...config.whitelist,
			...whitelist,
		],

		aliases: {
			...config.aliases,
			...aliases,
		},

		async onAfterCall(ctx, route, req, res, data) {
			// Replace it to support ETag
			res.setHeader('X-Custom-Header', '123456');
			return transformResponse(req.url, data);
		},
	};
};

module.exports = registerApi;
