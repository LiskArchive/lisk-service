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
const topAccountsSource = require('../../../sources/version3/topAccounts');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/tokens/lsk/top',
	rpcMethod: 'get.tokens.lsk.top',
	params: {
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		sort: {
			optional: true,
			type: 'string',
			enum: ['balance:asc', 'balance:desc'],
			default: 'balance:desc',
		},
	},
	source: topAccountsSource,
	envelope,
};
