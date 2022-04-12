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
} = require('../shared/dataService/blocks');

module.exports = [
	{
		name: 'getBlocks',
		controller: getBlocks,
		params: {
			blockId: { optional: true, type: 'any' },
			height: { optional: true, type: 'any' },
			generatorAddress: { optional: true, type: 'any' },
			generatorPublicKey: { optional: true, type: 'any' },
			generatorUsername: { optional: true, type: 'any' },
			timestamp: { optional: true, type: 'any' },
			limit: { optional: true, type: 'any' },
			offset: { optional: true, type: 'any' },
			sort: { optional: true, type: 'any' },
		},
	},
	{
		name: 'getLastBlock',
		controller: getLastBlock,
		params: {
			limit: { optional: true, type: 'any' },
			offset: { optional: true, type: 'any' },
		},
	},
];
