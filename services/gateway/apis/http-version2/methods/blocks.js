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
const blocksSource = require('../../../sources/version2/blocks');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/blocks',
	rpcMethod: 'get.blocks',
	tags: ['Blocks'],
	params: {
		blockId: { optional: true, type: 'string', min: 1, max: 64 },
		height: { optional: true, type: 'number', min: 1 },
		timestamp: { optional: true, type: 'string' },
		generatorAddress: { optional: true, type: 'string', min: 38, max: 41 },
		generatorPublicKey: { optional: true, type: 'string', min: 1, max: 64 },
		generatorUsername: { optional: true, type: 'string', min: 1, max: 20 },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		sort: {
			optional: true,
			type: 'string',
			enum: ['height:asc', 'height:desc', 'timestamp:asc', 'timestamp:desc'],
			default: 'height:desc',
		},
	},
	source: blocksSource,
	envelope,
};
