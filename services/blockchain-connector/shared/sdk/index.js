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
const { Signals } = require('lisk-service-framework');

const config = require('../../config');

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
	getRegisteredEndpoints,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
	getSystemMetadata,
	getEngineEndpoints,
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
	tokenHasUserAccount,
	tokenHasEscrowAccount,
	getTokenBalance,
	getTokenBalances,
	getEscrowedAmounts,
	getSupportedTokens,
	getTotalSupply,
	getTokenInitializationFees,
	updateTokenInfo,
} = require('./token');

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

const { getFeeTokenID, getMinFeePerByte, cacheFeeConstants } = require('./fee');

const { getAuthAccount, getAuthMultiSigRegMsgSchema } = require('./auth');

const {
	getChainAccount,
	getMainchainID,
	getChannel,
	getRegistrationFee,
} = require('./interoperability');

const { getLegacyAccount } = require('./legacy');
const { getEventsByHeight } = require('./events');
const { invokeEndpointProxy } = require('./invoke');
const { setSchemas, setMetadata } = require('./schema');
const { getValidator, validateBLSKey } = require('./validators');
const {
	getNetworkStatus,
	getNetworkPeers,
	getNetworkConnectedPeers,
	getNetworkDisconnectedPeers,
	getNetworkPeersStatistics,
} = require('./network');

const { cacheCleanup } = require('./cache');
const { formatTransaction } = require('./formatter');
const { encodeCCM } = require('./encoder');

const init = async () => {
	// Cache all the schemas
	setSchemas(await getSchemas());
	setMetadata(await getSystemMetadata());

	// Initialize the local cache
	await getNodeInfo(true);
	await cacheRegisteredRewardModule();
	await cacheFeeConstants();
	await updateTokenInfo();
	await getTokenInitializationFees();
	await getRewardTokenID();
	await getPosConstants();
	await getAllPosValidators();

	// Download the genesis block, if applicable
	await getGenesisBlock().then(() => {
		Signals.get('genesisBlockDownloaded').dispatch();
	});

	if (config.appExitDelay) {
		setTimeout(() => process.exit(0), config.appExitDelay);
	}
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
	getRegisteredEndpoints,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
	getSystemMetadata,
	getEngineEndpoints,

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
	formatTransaction,

	// Tokens
	tokenHasUserAccount,
	tokenHasEscrowAccount,
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
	getChannel,
	getChainRegistrationFee: getRegistrationFee,

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
	getNetworkPeers,
	getNetworkConnectedPeers,
	getNetworkDisconnectedPeers,
	getNetworkPeersStatistics,

	// CCM
	encodeCCM,

	// Cache
	cacheCleanup,
};
