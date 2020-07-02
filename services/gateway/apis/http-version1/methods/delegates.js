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
	swaggerApiPath: '/delegates',
	params: {
		address: { required: false, type: 'string', minLength: 2 },
		publickey: { required: false, type: 'string', minLength: 1 },
		secpubkey: { required: false, type: 'string', minLength: 1 },
		username: { required: false, type: 'string', minLength: 1 },
		search: { required: false, type: 'string', minLength: 1 },
		limit: { required: false, type: 'number', min: 1, max: 101, default: 10 },
		offset: { required: false, type: 'number', min: 0, default: 0 },
		sort: {
			required: false,
			type: 'string',
			enum: [
				'username:asc', 'username:desc',
				'rank:asc', 'rank:desc',
				'productivity:asc', 'productivity:desc',
				'missedBlocks:asc', 'missedBlocks:desc',
			],
			default: 'rank:asc',
		},
	},
	source: delegatesSource,
	envelope,
};
