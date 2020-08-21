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
const delegatesSource = require('../../../sources/delegates');
const envelope = require('../../../sources/mappings/stdEnvelope');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/delegates/next_forgers',
	rpcMethod: 'get.delegates.next_forgers',
	params: {
		limit: { optional: true, min: 1, max: 101, type: 'number' },
		offset: { optional: true, min: 0, type: 'number' },
	},
	source: {
		...delegatesSource,
		method: 'core.delegates.next_forgers',
		params: {
			offset: '=',
			limit: '=',
		},
	},
	envelope,
};
