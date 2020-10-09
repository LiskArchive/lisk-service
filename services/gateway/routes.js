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

const enableApiHTTP = config.api.http.split(',');

const exportedApi = enableApiHTTP.map(apiName => {
	let apiInfo;
	if (apiName === 'http-version1') {
		apiInfo = registerApi('http-version1', { ...defaultConfig, path: '/v1' });
	}
	if (apiName === 'http-version1-compat') {
		apiInfo = registerApi('http-version1-compat', { ...defaultConfig, path: '/v1' });
	}
	if (apiName === 'http-test') {
		apiInfo = registerApi('http-test', { ...defaultConfig, path: '/test' });
	}
	if (apiName === 'http-status') {
		apiInfo = registerApi('http-status', { ...defaultConfig, path: '/' });
	}
	return apiInfo;
});

module.exports = exportedApi;
