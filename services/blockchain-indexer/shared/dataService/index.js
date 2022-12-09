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
	resolveMultisignatureMemberships,
	getAllDelegates,
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
	getVotesByTransactionIDs,
	getEventsByHeight,
	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountByName,
} = require('./business');

const {
	getAccounts,
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
	getInflationRate,
	getRewardConstants,
} = require('./dynamicReward');

const {
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
} = require('./peers');

const {
	getTokens,
	getTopLiskAddresses,
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
	getBlockchainApps,
	getBlockchainAppsStatistics,
	reloadBlockchainAppsStats,
} = require('./interoperability');

const { getEvents } = require('./events');
const { getSchemas } = require('./schemas');
const { getAuthAccountInfo } = require('./auth');
const { getNetworkStatus } = require('./network');
const { getLegacyAccountInfo } = require('./legacy');
const { getValidator, validateBLSKey } = require('./validator');
const { reloadGeneratorsCache, getGenerators } = require('./generators');

module.exports = {
	// Accounts
	getAccounts,

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
	getTokens,
	getTopLiskAddresses,
	getTokensSummary,

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
	reloadBlockchainAppsStats,

	// Events
	getEvents,

	// Schemas
	getSchemas,

	// Auth
	getAuthAccountInfo,

	// Network
	getNetworkStatus,

	// Legacy
	getLegacyAccountInfo,

	// Validator
	getValidator,
	validateBLSKey,

	// Generators
	reloadGeneratorsCache,
	getGenerators,

	// Others to be arranged
	getMultisignatureGroups,
	getMultisignatureMemberships,
	getAccountsByAddress,
	getAccountsByPublicKey,
	getAccountsByPublicKey2,
	getIndexedAccountInfo,
	resolveMultisignatureMemberships,
	getAllDelegates,
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
	getVotesByTransactionIDs,
	getPosLockedRewards,
	getEventsByHeight,
	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountByName,

	getInflationRate,
	getDefaultRewardAtHeight,
	getRewardConstants,
};
