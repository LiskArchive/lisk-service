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
const { getGenerators, getNumberOfGenerators, reloadGeneratorsCache } = require('./generators');

const {
	formatBlock,
	getBlocks,
	getFinalizedHeight,
	normalizeBlocks,
	getLastBlock,
	getBlockByHeight,
	getBlockByID,
	getBlocksAssets,
} = require('./blocks');

const {
	getTransactions,
	getTransactionIDsByBlockID,
	getTransactionsByBlockID,
	getTransactionsByIDs,
	normalizeTransaction,
	formatTransactionsInBlock,
} = require('./transactions');

const {
	getPendingTransactions,
	loadAllPendingTransactions,
	formatPendingTransaction,
} = require('./pendingTransactions');

const {
	getBlockchainApps,
	getBlockchainAppsStatistics,
	getChainAccount,
	getMainchainID,
	reloadBlockchainAppsStats,
	isMainchain,
	resolveMainchainServiceURL,
	resolveChannelInfo,
	getCurrentChainID,
} = require('./interoperability');

const {
	tokenHasUserAccount,
	getAvailableTokenIDs,
	getTokenBalances,
	getTokenSummary,
	getTokenConstants,
	getTokenTopBalances,
} = require('./token');

const {
	getPosValidators,
	getAllPosValidators,
	getPosValidatorsByStake,
	isPosModuleRegistered,
	getPosLockedRewards,
	getStakes,
	getStakers,
	getPosClaimableRewards,
	getPosUnlocks,
	getPosConstants,
} = require('./pos');

const {
	getDefaultRewardAtHeight,
	getAnnualInflation,
	getRewardConstants,
} = require('./dynamicReward');

const { getSchemas } = require('./schemas');
const { getAuthAccountInfo } = require('./auth');
const { getLegacyAccountInfo } = require('./legacy');
const { postTransactions } = require('./postTransactions');
const {
	getEvents,
	getEventsByHeight,
	cacheEventsByBlockID,
	deleteEventsFromCacheByBlockID,
	getEventsByBlockID,
	deleteEventsFromCache,
} = require('./events');
const { dryRunTransactions } = require('./transactionsDryRun');
const { getValidator, validateBLSKey } = require('./validator');
const {
	getNetworkStatus,
	getNetworkPeers,
	getNetworkConnectedPeers,
	getNetworkDisconnectedPeers,
	getNetworkPeersStatistics,
} = require('./network');
const { estimateTransactionFees } = require('./transactionsEstimateFees');
const { invokeEndpoint } = require('./invoke');

const { setFeeEstimates, getFeeEstimates, initFeeEstimates } = require('./feeEstimates');

module.exports = {
	// Generators
	getGenerators,
	getNumberOfGenerators,
	reloadGeneratorsCache,

	// Blocks
	formatBlock,
	getBlocks,
	getFinalizedHeight,
	normalizeBlocks,
	getLastBlock,
	getBlockByHeight,
	getBlockByID,
	getBlocksAssets,

	// Transactions
	getTransactions,
	getTransactionIDsByBlockID,
	getTransactionsByBlockID,
	getTransactionsByIDs,
	normalizeTransaction,
	getPendingTransactions,
	loadAllPendingTransactions,
	formatPendingTransaction,
	postTransactions,
	dryRunTransactions,
	estimateTransactionFees,
	formatTransactionsInBlock,

	// Events
	getEvents,
	getEventsByHeight,
	cacheEventsByBlockID,
	deleteEventsFromCacheByBlockID,
	getEventsByBlockID,
	deleteEventsFromCache,

	// Interoperability
	getBlockchainApps,
	getChainAccount,
	getMainchainID,
	getBlockchainAppsStatistics,
	reloadBlockchainAppsStats,
	isMainchain,
	resolveMainchainServiceURL,
	resolveChannelInfo,
	getCurrentChainID,

	// Token
	tokenHasUserAccount,
	getAvailableTokenIDs,
	getTokenBalances,
	getTokenSummary,
	getTokenConstants,
	getTokenTopBalances,

	// PoS
	getPosValidators,
	getAllPosValidators,
	getPosValidatorsByStake,
	isPosModuleRegistered,
	getPosLockedRewards,
	getStakes,
	getStakers,
	getPosClaimableRewards,
	getPosUnlocks,
	getPosConstants,

	// Schemas
	getSchemas,

	// Auth
	getAuthAccountInfo,

	// Legacy
	getLegacyAccountInfo,

	// Validator
	getValidator,
	validateBLSKey,

	// Dynamic Reward
	getAnnualInflation,
	getDefaultRewardAtHeight,
	getRewardConstants,

	// Fee estimates
	initFeeEstimates,
	setFeeEstimates,
	getFeeEstimates,

	// Network
	getNetworkStatus,
	getNetworkPeers,
	getNetworkConnectedPeers,
	getNetworkDisconnectedPeers,
	getNetworkPeersStatistics,

	invokeEndpoint,
};
