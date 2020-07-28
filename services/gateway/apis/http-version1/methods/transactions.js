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
const transactionsSource = require('../../../sources/transactions');
const envelope = require('../../../sources/mappings/stdEnvelope');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions',
	rpcMethod: 'get.transactions',
	params: {
		id: { optional: true, type: 'string', min: 1 },
		type: { optional: true, type: 'number', min: 0, max: 12 },
		address: { optional: true, type: 'string', min: 1 },
		sender: { optional: true, type: 'string', min: 1 },
		recipient: { optional: true, type: 'string', min: 1 },
		min: { optional: true, type: 'string', min: 1 },
		max: { optional: true, type: 'string', min: 1 },
		from: { optional: true, type: 'string', min: 1 },
		to: { optional: true, type: 'string', min: 1 },
		block: { optional: true, type: 'string', min: 1 },
		height: { optional: true, type: 'string', min: 1 },
		limit: { optional: true, type: 'number', min: 1, max: 100 },
		offset: { optional: true, type: 'number', min: 0 },
		sort: { optional: true, type: 'string', min: 1 }, // TODO: Convert to enum
	},
	source: transactionsSource,
	envelope,
};
