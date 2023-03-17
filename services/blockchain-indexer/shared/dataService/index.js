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
	isPosModuleRegistered,
	getNumberOfGenerators,
	reloadGeneratorsCache,
	getFinalizedHeight,
	normalizeBlocks,
	getBlockByHeight,
	getBlockByID,
	loadAllPendingTransactions,
	getTransactionIDsByBlockID,
	getTransactionsByIDs,
	normalizeTransaction,
	getEventsByHeight,
	deleteEventsFromCache,
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
	getPosValidators,
	reloadValidatorCache,
	getPosConstants,
	getPosLockedRewards,
	getStakes,
	getStakers,
	getPosUnlocks,
	getPosClaimableRewards,
} = require('./pos');

const {
	getDefaultRewardAtHeight,
	getAnnualInflation,
	getRewardConstants,
} = require('./dynamicReward');

const {
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
} = require('./peers');

const {
	tokenHasUserAccount,
	getTokens,
	getTokensSummary,
	getTokenConstants,
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
	getBlockchainApps,
	getBlockchainAppsStatistics,
	getChainAccount,
	reloadBlockchainAppsStats,
} = require('./interoperability');

const { getEvents } = require('./events');
const { getSchemas } = require('./schemas');
const { getAuthAccountInfo } = require('./auth');
const { getNetworkStatus } = require('./network');
const { getIndexStatus } = require('./indexStatus');
const { getLegacyAccountInfo } = require('./legacy');
const { getValidator, validateBLSKey } = require('./validator');
const { getGenerators } = require('./generators');

module.exports = {
	// Blocks
	getBlocks,
	getBlocksAssets,
	setLastBlock,
	getLastBlock,
	getTotalNumberOfBlocks,
	performLastBlockUpdate,

	// PoS
	getPosValidators,
	reloadValidatorCache,
	getPosConstants,
	getPosUnlocks,
	getStakes,
	getStakers,
	getPosClaimableRewards,

	// Peers
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,

	// Token
	tokenHasUserAccount,
	getTokens,
	getTokensSummary,
	getTokenConstants,

	// Transactions
	getTransactions,
	getPendingTransactions,
	reloadAllPendingTransactions,
	postTransactions,
	getTransactionsByBlockID,
	dryRunTransactions,

	// Interoperability
	getBlockchainApps,
	getBlockchainAppsStatistics,
	getChainAccount,
	reloadBlockchainAppsStats,

	// Events
	getEvents,

	// Schemas
	getSchemas,

	// Auth
	getAuthAccountInfo,

	// Network
	getNetworkStatus,

	// Index Status
	getIndexStatus,

	// Legacy
	getLegacyAccountInfo,

	// Validator
	getValidator,
	validateBLSKey,

	// Generators
	reloadGeneratorsCache,
	getGenerators,

	isPosModuleRegistered,
	getNumberOfGenerators,
	getFinalizedHeight,
	normalizeBlocks,
	getBlockByHeight,
	getBlockByID,
	loadAllPendingTransactions,
	getTransactionIDsByBlockID,
	getTransactionsByIDs,
	normalizeTransaction,
	getPosLockedRewards,
	getEventsByHeight,
	deleteEventsFromCache,

	getAnnualInflation,
	getDefaultRewardAtHeight,
	getRewardConstants,
};
