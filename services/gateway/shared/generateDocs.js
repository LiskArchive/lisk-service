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
const BluebirdPromise = require('bluebird');
const { requireAllJson } = require('./utils');
const config = require('../config');
const { exists } = require('./fsUtils');

const createApiDocs = async (apiName, apiJsonPaths, registeredModuleNames) => {
	const methodsDir = path.resolve(__dirname, `../apis/${apiName}/methods`);
	// Load generic method definitions
	const services = Utils.requireAllJs(methodsDir);
	// Load module specific method definitions
	await BluebirdPromise.map(
		registeredModuleNames,
		async module => {
			const dirPath = path.resolve(`${methodsDir}/modules/${module}`);
			if (await exists(dirPath)) Object.assign(services, Utils.requireAllJs(dirPath));
		},
		{ concurrency: registeredModuleNames.length },
	);

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

const genDocs = async (ctx, registeredModuleNames) => {
	if (!config.api.versions[ctx.endpoint.baseUrl]) return {
		info: { description: `This route offers no specs for ${ctx.endpoint.baseUrl}.` },
	};

	const finalDoc = {};

	const apis = Array.isArray(config.api.versions[ctx.endpoint.baseUrl])
		? config.api.versions[ctx.endpoint.baseUrl]
		: [config.api.versions[ctx.endpoint.baseUrl]];

	await BluebirdPromise.map(
		apis,
		async (api) => {
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
			const apiDocs = await createApiDocs(api, apiJson.paths, registeredModuleNames);
			Object.assign(paths, apiDocs);

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
		},
		{ concurrency: 1 },
	);

	return finalDoc;
};

module.exports = {
	genDocs,

	// For testing
	createApiDocs,
};
