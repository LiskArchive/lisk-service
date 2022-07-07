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
	getFinalizedHeight,
	normalizeBlocks,
	getBlockByHeight,
	getBlockByID,
	loadAllPendingTransactions,
	getTransactionsByBlockIDs,
	getTransactionsByIDs,
	normalizeTransaction,
	getVotesByTransactionIDs,
	getEventsByHeight,
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
	getDelegates,
	reloadDelegateCache,
	getTotalNumberOfDelegates,
} = require('./dpos');

const {
	reloadGeneratorsCache,
	getGenerators,
} = require('./generators');

const { getNetworkStatus } = require('./network');

const {
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
} = require('./peers');

const {
	getTokens,
} = require('./token');

const {
	getTransactions,
	getPendingTransactions,
	reloadAllPendingTransactions,
	postTransactions,
	getCommandsParamsSchemas,
	getTransactionsByBlockID,
} = require('./transactions');

const {
	getVotesSent,
	getVotesReceived,
	getUnlocks,
} = require('./dpos');

const {
	getBlockchainApps,
	getBlockchainAppsStatistics,
} = require('./interoperability');

const { getEvents } = require('./events');
const { getAuthAccountInfo } = require('./auth');
const { getValidator } = require('./validator');

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
	getVotesReceived,
	getVotesSent,
	getUnlocks,
	getEvents,
	getEventsByHeight,
	getAuthAccountInfo,
	getValidator,
};
