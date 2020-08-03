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
const blocksSource = require('../../../sources/blocks');
const envelope = require('../../../sources/mappings/stdEnvelope');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/blocks',
	params: {
		id: { optional: true, type: 'string', min: 1, max: 24 },
		height: { optional: true, type: 'number', min: 1 },
		from: { optional: true, type: 'number' },
		to: { optional: true, type: 'number' },
		address: { optional: true, type: 'string', min: 2 },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		sort: {
			optional: true,
			type: 'string',
			enum: [
				'height:asc', 'height:desc',
				'totalAmount:asc', 'totalAmount:desc',
				'totalFee:asc', 'totalFee:desc',
				'timestamp:asc', 'timestamp:desc',
			],
			default: 'height:desc',
		},
	},
	source: blocksSource,
	envelope,
};
