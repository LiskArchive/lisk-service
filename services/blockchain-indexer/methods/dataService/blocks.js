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
	getLastBlock,
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
		name: 'blocks.last',
		controller: getLastBlock,
		params: {
			limit: { optional: true, type: 'any' },
			offset: { optional: true, type: 'any' },
		},
	},
];
