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
	getGenesisHeight,
	getGenesisBlockID,
	getGenesisBlock,
	getGenesisConfig,
	getGenesisAssets,
	getGenesisAssetsLength,
} = require('./genesisBlock');

const {
	getGenerators,
	getGeneratorStatus,
	updateGeneratorStatus,
	getSchemas,
	getRegisteredActions,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
	getSystemMetadata,
} = require('./endpoints');

const {
	getLastBlock,
	getBlockByID,
	getBlocksByIDs,
	getBlockByHeight,
	getBlocksByHeightBetween,
} = require('./blocks');

const {
	getTransactionByID,
	getTransactionsByIDs,
	getTransactionsFromPool,
	postTransaction,
	dryRunTransaction,
} = require('./transactions');

const {
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
} = require('./peers');

const {
	tokenHasUserAccount,
	getTokenBalance,
	getTokenBalances,
	getEscrowedAmounts,
	getSupportedTokens,
	getTotalSupply,
	getTokenInitializationFees,
} = require('./tokens');

const {
	getAllPosValidators,
	getPosValidator,
	getPosValidatorsByStake,
	getPosConstants,
	getPosPendingUnlocks,
	getPosClaimableRewards,
	getPosLockedReward,
	getStaker,
	getPoSGenesisStakers,
	getPoSGenesisValidators,
} = require('./pos');

const {
	getRewardTokenID,
	getAnnualInflation,
	getDefaultRewardAtHeight,
	cacheRegisteredRewardModule,
} = require('./dynamicReward');

const {
	getFeeTokenID,
	getMinFeePerByte,
	cacheFeeConstants,
} = require('./fee');

const {
	getAuthAccount,
	getAuthMultiSigRegMsgSchema,
} = require('./auth');

const {
	getChainAccount,
	getMainchainID,
} = require('./interoperability');

const { getLegacyAccount } = require('./legacy');
const { getEventsByHeight } = require('./events');
const { invokeEndpointProxy } = require('./invoke');
const { setSchemas, setMetadata } = require('./schema');
const { getValidator, validateBLSKey } = require('./validators');
const { getNetworkStatus } = require('./network');

const init = async () => {
	// Initialize the local cache
	await getNodeInfo(true);
	await cacheRegisteredRewardModule();
	await cacheFeeConstants();

	// Cache all the schemas
	setSchemas(await getSchemas());
	setMetadata(await getSystemMetadata());

	// Download the genesis block, if applicable
	await getGenesisBlock();
};

module.exports = {
	init,

	// Genesis block
	getGenesisHeight,
	getGenesisBlockID,
	getGenesisBlock,
	getGenesisConfig,
	getGenesisAssets,
	getGenesisAssetsLength,

	// Endpoints
	getGenerators,
	getGeneratorStatus,
	updateGeneratorStatus,
	getSchemas,
	getRegisteredActions,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
	getSystemMetadata,

	// Blocks
	getLastBlock,
	getBlockByID,
	getBlocksByIDs,
	getBlockByHeight,
	getBlocksByHeightBetween,

	// Transactions
	getTransactionByID,
	getTransactionsByIDs,
	getTransactionsFromPool,
	postTransaction,
	dryRunTransaction,

	// Peers
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,

	// Tokens
	tokenHasUserAccount,
	getTokenBalance,
	getTokenBalances,
	getEscrowedAmounts,
	getSupportedTokens,
	getTotalSupply,
	getTokenInitializationFees,

	// PoS
	getAllPosValidators,
	getPosValidator,
	getPosValidatorsByStake,
	getPosConstants,
	getPosPendingUnlocks,
	getPosClaimableRewards,
	getPosLockedReward,
	getStaker,
	getPoSGenesisStakers,
	getPoSGenesisValidators,

	// Reward
	getRewardTokenID,
	getAnnualInflation,
	getDefaultRewardAtHeight,

	// Fee
	getFeeTokenID,
	getMinFeePerByte,
	cacheFeeConstants,

	// Auth
	getAuthAccount,
	getAuthMultiSigRegMsgSchema,

	// Interoperability
	getChainAccount,
	getMainchainID,

	// Legacy
	getLegacyAccount,

	// Events
	getEventsByHeight,

	// Invoke
	invokeEndpointProxy,

	// Schema
	setSchemas,
	setMetadata,

	// Validators
	getValidator,
	validateBLSKey,

	// Network
	getNetworkStatus,
};
