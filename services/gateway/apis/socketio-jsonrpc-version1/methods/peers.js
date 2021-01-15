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
const peersSource = require('../../../sources/version1/peers');
const envelope = require('../../../sources/version1/mappings/stdEnvelope');


module.exports = {
	version: '2.0',
	method: 'get.peers',
	envelope,
	params: {
		ip: { required: false, type: 'string' },
		httpPort: { required: false, type: 'number' },
		wsPort: { required: false, type: 'number' },
		os: { required: false, type: 'string' },
		version: { required: false, minLength: 5, type: 'string' },
		state: { required: false, type: 'number', enum: [0, 1, 2] },
		height: { required: false, type: 'number' },
		broadhash: { required: false, type: 'string' },
		limit: { required: false, min: 1, max: 100, type: 'number' },
		offset: { required: false, min: 0, type: 'number' },
		sort: { required: false, enum: ['height:asc', 'height:desc', 'version:asc', 'version:desc'] },
	},
	source: peersSource,
};
