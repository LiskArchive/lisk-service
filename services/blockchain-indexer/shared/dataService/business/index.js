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
	getGenerators,
	getNumberOfGenerators,
	reloadGeneratorsCache,
} = require('./generators');

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
	getTransactions,
	getTransactionIDsByBlockID,
	getTransactionsByBlockID,
	getTransactionsByIDs,
	normalizeTransaction,
} = require('./transactions');

const {
	getPendingTransactions,
	loadAllPendingTransactions,
} = require('./pendingTransactions');

const {
	getPeersStatistics,
} = require('./peers');

const {
	getBlockchainApps,
	getBlockchainAppsStatistics,
	reloadBlockchainAppsStats,
} = require('./interoperability');

const {
	getTokens,
	getTokensSummary,
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
	getInflationRate,
	getRewardConstants,
} = require('./dynamicReward');

const { getSchemas } = require('./schemas');
const { getAuthAccountInfo } = require('./auth');
const { getLegacyAccountInfo } = require('./legacy');
const { postTransactions } = require('./postTransactions');
const { getEvents, getEventsByHeight } = require('./events');
const { dryRunTransactions } = require('./transactionsDryRun');
const { getValidator, validateBLSKey } = require('./validator');

module.exports = {
	// Generators
	getGenerators,
	getNumberOfGenerators,
	reloadGeneratorsCache,

	// Blocks
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
	postTransactions,
	dryRunTransactions,

	// Events
	getEvents,
	getEventsByHeight,

	// Interoperability
	getBlockchainApps,
	getBlockchainAppsStatistics,
	reloadBlockchainAppsStats,

	// Token
	getTokens,
	getTokensSummary,

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

	// Peers
	getPeersStatistics,

	getInflationRate,
	getDefaultRewardAtHeight,
	getRewardConstants,
};
