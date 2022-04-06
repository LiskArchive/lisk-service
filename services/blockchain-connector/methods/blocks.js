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
	getLastBlock,
	getBlockByID,
	getBlocksByIDs,
	getBlockByHeight,
	getBlocksByHeightBetween,
} = require('../shared/sdk/actions');

const { getGenesisBlock } = require('../shared/sdk/genesisBlock');

module.exports = [
	{
		name: 'getLastBlock',
		controller: getLastBlock,
		params: {},
	},
	{
		name: 'getBlockByID',
		controller: async ({ id }) => getBlockByID(id),
		params: {
			id: { optional: false, type: 'any' },
		},
	},
	{
		name: 'getBlocksByIDs',
		controller: async ({ ids }) => getBlocksByIDs(ids),
		params: {
			ids: { optional: false, type: 'any' },
		},
	},
	{
		name: 'getBlockByHeight',
		controller: async ({ height }) => getBlockByHeight(height),
		params: {
			height: { optional: false, type: 'any' },
		},
	},
	{
		name: 'getBlocksByHeightBetween',
		controller: async ({ from, to }) => getBlocksByHeightBetween({ from, to }),
		params: {
			from: { optional: false, type: 'any' },
			to: { optional: false, type: 'any' },
		},
	},
	{
		name: 'getGenesisBlock',
		controller: async () => getGenesisBlock(),
		params: {},
	},
];
