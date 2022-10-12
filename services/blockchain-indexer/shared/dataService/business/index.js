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
	getFinalizedHeight,
	normalizeBlocks,
	getLastBlock,
	getBlockByHeight,
	getBlockByID,
	getBlocksAssets,
} = require('./blocks');

const {
	getBlockchainApps,
	getBlockchainAppsStatistics,
	reloadBlockchainAppsStats,
} = require('./interoperability');

const {
	getLegacyAccountInfo,
} = require('./legacy');

const {
	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountByName,
} = require('./coreCache');

const {
	getDelegates,
	getAllDelegates,
	isDposModuleRegistered,
} = require('./delegates');

const {
	getGenerators,
	getNumberOfGenerators,
} = require('./generators');

const {
	getPendingTransactions,
	loadAllPendingTransactions,
} = require('./pendingTransactions');

const {
	postTransactions,
} = require('./postTransactions');

const {
	getTokens,
	getTopLiskAddresses,
	getSupportedTokens,
} = require('./tokens');

const {
	getTransactions,
	getTransactionIDsByBlockID,
	getTransactionsByBlockID,
	getTransactionsByIDs,
	normalizeTransaction,
} = require('./transactions');

const {
	getCommandsParamsSchemas,
} = require('./commandsParamsSchemas');

const {
	getVotesByTransactionIDs,
	getVotesReceived,
	getVotesSent,
	getUnlocks,
	getDPoSConstants,
} = require('./dpos');

const { getAuthAccountInfo } = require('./auth');
const {
	getValidator,
	validateBLSKey,
} = require('./validator');
const { getEvents, getEventsByHeight } = require('./events');

module.exports = {
	getBlocks,
	getFinalizedHeight,
	normalizeBlocks,
	getLastBlock,
	getBlockByHeight,
	getBlockByID,
	getBlocksAssets,
	getBlockchainApps,
	getBlockchainAppsStatistics,
	reloadBlockchainAppsStats,
	getDelegates,
	getAllDelegates,
	isDposModuleRegistered,
	getGenerators,
	getNumberOfGenerators,
	postTransactions,
	getTokens,
	getTopLiskAddresses,
	getSupportedTokens,
	getPendingTransactions,
	loadAllPendingTransactions,
	getTransactions,
	getTransactionIDsByBlockID,
	getTransactionsByBlockID,
	getTransactionsByIDs,
	getCommandsParamsSchemas,
	normalizeTransaction,
	getVotesByTransactionIDs,
	getVotesReceived,
	getVotesSent,
	getUnlocks,
	getDPoSConstants,
	getAuthAccountInfo,

	getValidator,
	validateBLSKey,

	getEvents,
	getEventsByHeight,
	getLegacyAccountInfo,
	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountByName,
};
