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

const apiJsonVersion1 = require('./version1/apiSchema');
const apiJsonVersion2 = require('./version2/apiSchema');

const createApiDocs = async (apiName, apiJson) => {
	const services = Utils.requireAllJs(path.resolve(__dirname, `../${apiName}/methods`));
	const methods = Object.keys(services).reduce((acc, key) => {
		const method = services[key];
		return { ...acc, [key]: method.schema };
	}, {});
	const apiSchemas = Object.keys(methods);
	apiSchemas.forEach((key) => {
		Object.assign(apiJson.paths, methods[key]);
	});
	return apiJson;
};

const genDocs = (ctx) => {
	let swaggerDoc;
	if (ctx.endpoint.baseUrl === '/api/v1') {
		const { apiJson } = apiJsonVersion1;
		apiJson.parameters = apiJsonVersion1.parameters;
		apiJson.definitions = apiJsonVersion1.definitions;
		apiJson.responses = apiJsonVersion1.responses;
		swaggerDoc = createApiDocs('http-version1', apiJson);
	} else if (ctx.endpoint.baseUrl === '/api/v2') {
		const { apiJson } = apiJsonVersion2;
		apiJson.parameters = apiJsonVersion2.parameters;
		apiJson.definitions = apiJsonVersion2.definitions;
		apiJson.responses = apiJsonVersion2.responses;
		swaggerDoc = createApiDocs('http-version2', apiJson);
	}
	return swaggerDoc;
};

module.exports = {
	genDocs,
};
