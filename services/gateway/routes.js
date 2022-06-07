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
const config = require('./config');
const registerApi = require('./shared/registerHttpApi');

const defaultConfig = {
	whitelist: [
		'$node.*',
	],

	aliases: {
		'GET health': '$node.health',
	},

	callOptions: {
		timeout: 30000,
		retries: 3,
	},

	authorization: false,
	mergeParams: true,

	mappingPolicy: 'restrict',

	bodyParsers: {
		json: true,
		urlencoded: { extended: true },
	},
};

// Update when adding new APIs
const PATH_API_MAPPINGS = {
	'/': ['http-status'],
	'/test': ['http-test'],
	'/v2': ['http-version2', 'http-exports'],
};

const filterApis = (requiredApis) => {
	requiredApis = requiredApis.split(',');

	const filteredApis = [];

	// Filter the APIs to be registered on the gateway based on 'requiredApis' config
	const apisToRegister = Object.keys(PATH_API_MAPPINGS)
		.reduce((acc, path) => {
			requiredApis.forEach(api => {
				if (PATH_API_MAPPINGS[path].includes(api)) {
					if (Array.isArray(acc[path])) {
						acc[path].push(api);
					} else {
						acc[path] = [api];
					}
				}
			});
			return acc;
		}, {});

	// Generate the final routes to be registered at the gateway in moleculer-web
	Object.entries(apisToRegister)
		.forEach(([path, apis]) => filteredApis.push(registerApi(apis, { ...defaultConfig, path })));

	return filteredApis;
};

module.exports = filterApis(config.api.http);
