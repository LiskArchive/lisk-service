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
const peersSource = require('../../../sources/peers');
const envelope = require('../../../sources/mappings/stdEnvelope');


module.exports = {
	version: '2.0',
	swaggerApiPath: '/peers',
	params: {
		ip: { optional: true, type: 'string' },
		httpPort: { optional: true, type: 'number' },
		wsPort: { optional: true, type: 'number' },
		os: { optional: true, type: 'string' },
		version: { optional: true, min: 5, type: 'string' },
		state: { optional: true, type: 'number', enum: [0, 1, 2] },
		height: { optional: true, type: 'number' },
		broadhash: { optional: true, type: 'string' },
		limit: { optional: true, min: 1, max: 100, type: 'number' },
		offset: { optional: true, min: 0, type: 'number' },
		sort: { optional: true, type: 'string', enum: ['height:asc', 'height:desc', 'version:asc', 'version:desc'] },
	},
	source: peersSource,
	envelope,
};
