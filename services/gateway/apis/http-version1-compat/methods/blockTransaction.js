/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const transactionsSource = require('../../../sources/transactions');
const envelope = require('../../../sources/mappings/stdEnvelope');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/block/{block}/transactions',
	params: {
		block: { optional: false, type: 'string', min: 1, max: 24 },
		offset: { optional: true, type: 'number', min: 0 },
		limit: { optional: true, type: 'number', min: 1, max: 100 },
		min: { optional: true, type: 'string', min: 1 },
		max: { optional: true, type: 'string', min: 1 },
		from: { optional: true, type: 'string', min: 1 },
		to: { optional: true, type: 'string', min: 1 },
		sort: {
			optional: true,
			type: 'string',
			min: 1,
			enum: [
				'amount:asc', 'amount:desc', 'fee:asc', 'fee:desc',
				'type:asc', 'type:desc', 'timestamp:asc', 'timestamp:desc',
			],
			default: 'amount:asc',
		},
	},
	source: transactionsSource,
	envelope,
};
