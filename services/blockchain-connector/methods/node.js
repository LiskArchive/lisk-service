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
	invokeEndpoint,
	getSchemas,
	getRegisteredActions,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
} = require('../shared/sdk/endpoints');

module.exports = [
	{
		name: 'invokeEndpoint',
		controller: async ({ action, params }) => invokeEndpoint(action, params),
		params: {
			action: { optional: false, type: 'any' },
			params: { optional: false, type: 'any' },
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
];
