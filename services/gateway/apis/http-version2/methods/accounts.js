/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const accountsSource = require('../../../sources/version2/accounts');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/accounts',
	rpcMethod: 'get.accounts',
	tags: ['Accounts'],
	params: {
		address: { optional: true, type: 'string', min: 3, max: 41 },
		publicKey: { optional: true, type: 'string', min: 64, max: 64 },
		username: { optional: true, type: 'string', min: 1, max: 20 },
		isDelegate: { optional: true, type: 'boolean', min: 1 },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		sort: {
			optional: true,
			type: 'string',
			enum: ['balance:asc', 'balance:desc', 'rank:asc', 'rank:desc'],
			default: 'balance:desc',
		},
	},
	source: accountsSource,
	envelope,
};
