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

const {
	getBlocks,
	getBlocksAssets,
} = require('./controllers/blocks');

module.exports = [
	{
		name: 'blocks',
		controller: getBlocks,
		params: {
			blockID: { optional: true, type: 'any' },
			height: { optional: true, type: 'any' },
			generatorAddress: { optional: true, type: 'any' },
			timestamp: { optional: true, type: 'any' },
			limit: { optional: true, type: 'any' },
			offset: { optional: true, type: 'any' },
			sort: { optional: true, type: 'any' },
		},
	},
	{
		name: 'blocks.assets',
		controller: getBlocksAssets,
		params: {
			blockID: { optional: true, type: 'string' },
			height: { optional: true, type: 'string' },
			moduleID: { optional: true, type: 'string' },
			timestamp: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
			sort: { optional: true, type: 'string' },
		},
	},
];
