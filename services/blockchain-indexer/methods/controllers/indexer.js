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
const accounts = require('../../shared/indexer/accountIndex');

const blocks = require('../../shared/indexer/blockchainIndex');

const status = require('../../shared/indexer/indexStatus');

const triggerAccountUpdates = async () => accounts.triggerAccountUpdates();

const indexAllDelegateAccounts = async () => accounts.indexAllDelegateAccounts();

const cacheLegacyAccountInfo = async () => accounts.cacheLegacyAccountInfo();

const indexGenesisAccounts = async () => accounts.indexGenesisAccounts();

const indexNewBlock = async ({ height }) => blocks.indexNewBlock(height);

const indexMissingBlocks = async () => blocks.indexMissingBlocks();

const isGenesisBlockIndexed = async () => blocks.isGenesisBlockIndexed();

const getMissingBlocksListByRange = async (params) => blocks.getMissingBlocksListByRange(params);

const getIndexStats = async () => status.getIndexStats();

module.exports = {
	triggerAccountUpdates,
	indexAllDelegateAccounts,
	cacheLegacyAccountInfo,
	indexGenesisAccounts,

	indexNewBlock,
	indexMissingBlocks,
	getMissingBlocksListByRange,
	isGenesisBlockIndexed,

	getIndexStats,
};
