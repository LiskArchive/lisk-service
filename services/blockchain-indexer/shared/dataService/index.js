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
	getMultisignatureGroups,
	getMultisignatureMemberships,
	getAccountsByAddress,
	getAccountsByPublicKey,
	getAccountsByPublicKey2,
	getIndexedAccountInfo,
	getAccountsBySearch,
	resolveMultisignatureMemberships,
	getAllDelegates,
	isDposModuleRegistered,
	getNumberOfGenerators,
	getGenesisHeight,
	getFinalizedHeight,
	normalizeBlocks,
	getBlockByHeight,
	getBlockByID,
	loadAllPendingTransactions,
	getTransactionsByBlockIDs,
	getTransactionsByIDs,
	normalizeTransaction,
	getVotesByTransactionIDs,
	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountBySecondPublicKey,
	getCachedAccountByUsername,
	getTokens,
} = require('./business');

const {
	getAccounts,
	getLegacyAccountInfo,
} = require('./accounts');

const {
	getBlocks,
	getBlocksAssets,
	setLastBlock,
	getLastBlock,
	getTotalNumberOfBlocks,
	performLastBlockUpdate,
} = require('./blocks');

const {
	getBlockchainAppsStatistics,
	getBlockchainApps,
} = require('./blockchainApps');

const {
	reloadDelegateCache,
	getTotalNumberOfDelegates,
	getDelegates,
	reloadGeneratorsCache,
	getGenerators,
} = require('./delegates');

const { getNetworkStatus } = require('./network');

const {
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
} = require('./peers');

const {
	getTransactions,
	getPendingTransactions,
	reloadAllPendingTransactions,
	postTransactions,
	getCommandsParamsSchemas,
	getTransactionsByBlockID,
} = require('./transactions');

const { getVoters } = require('./voters');

const { getVotes } = require('./dpos');

const { getEvents } = require('./events');

module.exports = {
	getMultisignatureGroups,
	getMultisignatureMemberships,
	getAccountsByAddress,
	getAccountsByPublicKey,
	getAccountsByPublicKey2,
	getIndexedAccountInfo,
	getAccountsBySearch,
	resolveMultisignatureMemberships,
	getAllDelegates,
	isDposModuleRegistered,
	getNumberOfGenerators,
	getGenesisHeight,
	getFinalizedHeight,
	normalizeBlocks,
	getBlockByHeight,
	getBlockByID,
	getGenerators,
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
	loadAllPendingTransactions,
	getTransactionsByBlockIDs,
	getTransactionsByIDs,
	normalizeTransaction,
	getVotesByTransactionIDs,
	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountBySecondPublicKey,
	getCachedAccountByUsername,

	getAccounts,
	getLegacyAccountInfo,
	getTokens,
	getBlocks,
	getBlocksAssets,
	setLastBlock,
	getLastBlock,
	getTotalNumberOfBlocks,
	performLastBlockUpdate,
	getBlockchainAppsStatistics,
	getBlockchainApps,
	reloadDelegateCache,
	getTotalNumberOfDelegates,
	getDelegates,
	reloadGeneratorsCache,
	getNetworkStatus,
	getTransactions,
	getPendingTransactions,
	reloadAllPendingTransactions,
	postTransactions,
	getCommandsParamsSchemas,
	getTransactionsByBlockID,
	getVoters,
	getVotes,
	getEvents,
};
