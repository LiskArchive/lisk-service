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
const invokeEndpointSource = require('../../../sources/version2/invoke');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/invoke',
	rpcMethod: 'get.invoke',
	params: {
		endpoint: { optional: false, type: 'string' },
		params: { optional: true, type: 'object' },
	},
	source: invokeEndpointSource,
};
