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
const registerApi = require('./shared/registerRpcApi');

const defaultConfig = {
	whitelist: [],
	aliases: {},
};

const enableApiWS = config.api.ws.split(',');
const exportedApi = {};

enableApiWS.forEach(apiName => {
	if ('rpc' === apiName) {
		exportedApi['/rpc'] = registerApi('http-version1', { ...defaultConfig });
	}
	if ('rpc-v1' === apiName) {
		exportedApi['/rpc-v1'] = registerApi('http-version1', { ...defaultConfig });
	}
	if ('rpc-test' === apiName) {
		exportedApi['/rpc-test'] = registerApi('http-version1', { ...defaultConfig });
	}
	if ('blockchain' === apiName) {
		exportedApi['/blockchain'] = {
			events: {
				call: {
					mappingPolicy: 'restrict',
					aliases: {},
				},
			},
		};
	}
});

module.exports = exportedApi;
