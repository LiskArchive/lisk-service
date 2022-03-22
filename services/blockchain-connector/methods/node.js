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
	invokeAction,
	getSchema,
	getRegisteredActions,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
} = require('./controllers/node');

module.exports = [
	{
		name: 'invokeAction',
		controller: invokeAction,
		params: {
			action: { optional: false, type: 'any' },
			params: { optional: false, type: 'any' },
		},
	},
	{
		name: 'getSchema',
		controller: getSchema,
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
