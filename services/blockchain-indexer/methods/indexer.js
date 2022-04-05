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
	triggerAccountUpdates,
	indexAllDelegateAccounts,
	cacheLegacyAccountInfo,
	indexGenesisAccounts,
	indexNewBlock,
	indexMissingBlocks,
	isGenesisBlockIndexed,
	getMissingBlocksListByRange,
	getIndexStats,
} = require('./controllers/indexer');

module.exports = [
	{
		name: 'indexMissingBlocks',
		controller: indexMissingBlocks,
		params: {},
	},
	{
		name: 'indexNewBlock',
		controller: indexNewBlock,
		params: {
			height: { optional: false, type: 'any' },
		},
	},
	{
		name: 'isGenesisBlockIndexed',
		controller: isGenesisBlockIndexed,
		params: {},
	},
	{
		name: 'getMissingBlocksList',
		controller: getMissingBlocksListByRange,
		params: {
			from: { optional: false, type: 'any' },
			to: { optional: false, type: 'any' },
		},
	},
	{
		name: 'indexGenesisAccounts',
		controller: indexGenesisAccounts,
		params: {},
	},
	{
		name: 'triggerAccountUpdates',
		controller: triggerAccountUpdates,
		params: {},
	},
	{
		name: 'indexAllDelegateAccounts',
		controller: indexAllDelegateAccounts,
		params: {},
	},
	{
		name: 'cacheLegacyAccountInfo',
		controller: cacheLegacyAccountInfo,
		params: {},
	},
	{
		name: 'getIndexStats',
		controller: getIndexStats,
		params: {},
	},
];
