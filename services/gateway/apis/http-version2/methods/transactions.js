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
const transactionsSource = require('../../../sources/version2/transactions');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions',
	rpcMethod: 'get.transactions',
	tags: ['Transactions'],
	params: {
		id: { optional: true, type: 'string', min: 1, max: 64 },
		moduleAssetId: { optional: true, type: 'string', min: 1, max: 3 },
		moduleAssetName: { optional: true, type: 'string', min: 1 },
		address: { optional: true, type: 'string', min: 38, max: 41 },
		sender: { optional: true, type: 'string', min: 1, max: 74 },
		recipient: { optional: true, type: 'string', min: 1, max: 74 },
		min: { optional: true, type: 'string', min: 1 },
		max: { optional: true, type: 'string', min: 1 },
		from: { optional: true, type: 'string', min: 1 },
		to: { optional: true, type: 'string', min: 1 },
		block: { optional: true, type: 'string', min: 1 },
		height: { optional: true, type: 'string', min: 1 },
		limit: { optional: true, type: 'number', min: 1, max: 100 },
		offset: { optional: true, type: 'number', min: 0 },
		sort: {
			optional: true,
			type: 'string',
			min: 1,
			enum: ['amount:asc', 'amount:desc', 'timestamp:asc', 'timestamp:desc', 'nonce:asc', 'nonce:desc'],
			default: 'timestamp:desc',
		},
	},
	source: transactionsSource,
	envelope,
};
