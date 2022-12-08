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
	getBlockchainApps,
	getBlockchainAppsStatistics,
	reloadBlockchainAppsStats,
} = require('./interoperability');

const {
	getTokens,
	getTopLiskAddresses,
	getTokensSummary,
} = require('./tokens');

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
	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountByName,
} = require('./coreCache');

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
	getTopLiskAddresses,
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

	// Core cache
	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountByName,
};
