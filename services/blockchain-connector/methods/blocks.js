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
} = require('../shared/sdk');

const {
	getGenesisHeight,
	getGenesisBlockID,
	getGenesisBlock,
	getGenesisConfig,
} = require('../shared/sdk/genesisBlock');

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
			id: { optional: false, type: 'string' },
		},
	},
	{
		name: 'getBlocksByIDs',
		controller: async ({ ids }) => getBlocksByIDs(ids),
		params: {
			ids: { optional: false, type: 'array', items: 'string' },
		},
	},
	{
		name: 'getBlockByHeight',
		controller: async ({ height }) => getBlockByHeight(height),
		params: {
			height: { optional: false, type: 'number' },
		},
	},
	{
		name: 'getBlocksByHeightBetween',
		controller: async ({ from, to }) => getBlocksByHeightBetween({ from, to }),
		params: {
			from: { optional: false, type: 'number' },
			to: { optional: false, type: 'number' },
		},
	},
	{
		name: 'getGenesisHeight',
		controller: getGenesisHeight,
		params: {},
	},
	{
		name: 'getGenesisBlockID',
		controller: getGenesisBlockID,
		params: {},
	},
	{
		name: 'getGenesisBlock',
		controller: getGenesisBlock,
		params: {},
	},
	{
		name: 'getGenesisConfig',
		controller: getGenesisConfig,
		params: {},
	},
];
