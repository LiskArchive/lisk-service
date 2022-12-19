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
	getAllDelegates,
	isDposModuleRegistered,
	getNumberOfGenerators,
	getFinalizedHeight,
	normalizeBlocks,
	getBlockByHeight,
	getBlockByID,
	loadAllPendingTransactions,
	getTransactionIDsByBlockID,
	getTransactionsByIDs,
	normalizeTransaction,
	getEventsByHeight,
} = require('./business');

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
	getDPoSConstants,
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
	getTokensSummary,
} = require('./token');

const {
	getTransactions,
	getPendingTransactions,
	reloadAllPendingTransactions,
	postTransactions,
	getTransactionsByBlockID,
	dryRunTransactions,
} = require('./transactions');

const {
	getVotesSent,
	getVotesReceived,
	getUnlocks,
} = require('./dpos');

const {
	getBlockchainApps,
	getBlockchainAppsStatistics,
	reloadBlockchainAppsStats,
} = require('./interoperability');

const {
	getLegacyAccountInfo,
} = require('./legacy');

const { getEvents } = require('./events');
const { getAuthAccountInfo } = require('./auth');
const { getValidator, validateBLSKey } = require('./validator');
const { getSchemas } = require('./schemas');

module.exports = {
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
	getTransactionIDsByBlockID,
	getTransactionsByIDs,
	normalizeTransaction,

	getLegacyAccountInfo,
	getTokens,
	getTokensSummary,
	getBlocks,
	getBlocksAssets,
	setLastBlock,
	getLastBlock,
	getTotalNumberOfBlocks,
	performLastBlockUpdate,
	getBlockchainAppsStatistics,
	reloadBlockchainAppsStats,
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
	getSchemas,
	getTransactionsByBlockID,
	dryRunTransactions,
	getVotesReceived,
	getVotesSent,
	getUnlocks,
	getDPoSConstants,
	getEvents,
	getEventsByHeight,
	getAuthAccountInfo,
	getValidator,
	validateBLSKey,
};
