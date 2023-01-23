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
const {
	Utils,
} = require('lisk-service-framework');
const path = require('path');
const { requireAllJson } = require('./utils');
const config = require('../config');

const createApiDocs = (apiName, apiJsonPaths, registeredModuleNames) => {
	const methodsDir = path.resolve(__dirname, `../apis/${apiName}/methods`);
	// Load generic method definitions
	const services = Utils.requireAllJs(methodsDir);
	// Load module specific method definitions
	registeredModuleNames.forEach(module => {
		const dirPath = path.resolve(`${methodsDir}/modules/${module}`);
		try {
			Object.assign(services, Utils.requireAllJs(dirPath));
		// eslint-disable-next-line no-empty
		} catch (err) {}
	});

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

const genDocs = (ctx, registeredModuleNames) => {
	if (!config.api.versions[ctx.endpoint.baseUrl]) return {
		info: { description: `This route offers no specs for ${ctx.endpoint.baseUrl}` },
	};

	const finalDoc = {};

	const apis = Array.isArray(config.api.versions[ctx.endpoint.baseUrl])
		? config.api.versions[ctx.endpoint.baseUrl]
		: [config.api.versions[ctx.endpoint.baseUrl]];

	apis.forEach((api) => {
		const { apiJson, parameters, definitions, responses } = requireAllJson(api);

		const params = finalDoc.parameters || {};
		Object.assign(params, parameters);

		const defs = finalDoc.definitions || {};
		Object.assign(defs, definitions);

		const allResponses = finalDoc.responses || {};
		Object.assign(allResponses, responses);

		const tags = finalDoc.tags || [];
		apiJson.tags.forEach(tag => tags.push(tag));

		const paths = finalDoc.paths || {};
		Object.assign(paths, createApiDocs(api, apiJson.paths, registeredModuleNames));

		Object.assign(finalDoc,
			{
				...apiJson,
				parameters: params,
				definitions: defs,
				responses: allResponses,
				tags,
				paths,
			},
		);
	});

	return finalDoc;
};

module.exports = {
	genDocs,
};
