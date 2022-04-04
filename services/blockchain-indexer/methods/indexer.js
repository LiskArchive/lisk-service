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
	indexNewBlocks,
	indexMissingBlocks,
	getMissingBlocksListByRange,
} = require('./controllers/indexer');

module.exports = [
	{
		name: 'indexMissingBlocks',
		controller: indexMissingBlocks,
		params: {},
	},
	{
		name: 'indexNewBlocks',
		controller: indexNewBlocks,
		params: {
			block: { optional: false, type: 'any' },
		},
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
];
