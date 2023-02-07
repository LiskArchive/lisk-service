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

const filterApis = (requiredApis, availableApis) => {
	const filteredApis = {};

	const requiredPaths = requiredApis.split(',').map(path => '/'.concat(path));
	Object.keys(availableApis).forEach(key => {
		if (requiredPaths.includes(key)) filteredApis[key] = availableApis[key]();
	});

	return filteredApis;
};

const getSocketNamespaces = (registeredModuleNames) => filterApis(
	config.api.ws,
	{
		'/rpc-v3': () => registerApi(['http-version3', 'http-exports'], { ...defaultConfig }, registeredModuleNames),
		'/rpc-test': () => registerApi('http-test', { ...defaultConfig }, registeredModuleNames),
		'/blockchain': () => ({
			events: {
				call: {
					mappingPolicy: 'restrict',
					aliases: {},
				},
			},
		}),
	},
);

module.exports = {
	getSocketNamespaces,
};
