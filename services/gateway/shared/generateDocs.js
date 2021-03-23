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
const { Utils } = require('lisk-service-framework');
const path = require('path');
const { requireAllJson } = require('./utils');
const config = require('../config');

const createApiDocs = (apiName, apiJsonPaths) => {
	const services = Utils.requireAllJs(path.resolve(__dirname, `../apis/${apiName}/methods`));
	const methods = Object.keys(services).reduce((acc, key) => {
		const method = services[key];
		return { ...acc, [key]: method.schema };
	}, {});
	if (methods.postTransactions) methods.transactions['/transactions'].post = methods.postTransactions['/transactions'].post;
	const apiSchemas = Object.keys(methods);
	apiSchemas.forEach((key) => {
		Object.assign(apiJsonPaths, methods[key]);
	});
	return apiJsonPaths;
};

const genDocs = ctx => {
	let httpVersion;
	if (ctx.endpoint.baseUrl === '/api/v1') {
		httpVersion = config.api.versions.apiVersion1;
	} else if (ctx.endpoint.baseUrl === '/api/v2') {
		httpVersion = config.api.versions.apiVersion2;
	}
	const { apiJson, parameters, definitions, responses } = requireAllJson(httpVersion);

	return {
		...apiJson,
		parameters,
		definitions,
		responses,
		paths: createApiDocs(httpVersion, apiJson.paths),
	};
};

module.exports = {
	genDocs,
};
