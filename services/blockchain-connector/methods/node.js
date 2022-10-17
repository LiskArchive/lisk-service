/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
	invokeEndpointProxy,
	getSchemas,
	getRegisteredActions,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
	getSystemMetadata,
} = require('../shared/sdk');

module.exports = [
	{
		name: 'invokeEndpoint',
		controller: async ({ endpoint, params }) => ({
			data: await invokeEndpointProxy(endpoint, params),
			meta: { endpoint, params },
		}),
		params: {
			endpoint: { optional: false, type: 'string' },
			params: { optional: true, type: 'object' },
		},
	},
	{
		name: 'getSchema',
		controller: getSchemas,
		params: {},
	},
	{
		name: 'getRegisteredActions',
		controller: getRegisteredActions,
		params: {},
	},
	{
		name: 'getRegisteredEvents',
		controller: getRegisteredEvents,
		params: {},
	},
	{
		name: 'getRegisteredModules',
		controller: getRegisteredModules,
		params: {},
	},
	{
		name: 'getNodeInfo',
		controller: getNodeInfo,
		params: {},
	},
	{
		name: 'getSystemMetadata',
		controller: getSystemMetadata,
		params: {},
	},
];
