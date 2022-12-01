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
	getGenesisHeight,
	getGenesisBlockID,
	getGenesisBlock,
	getGenesisConfig,
} = require('./genesisBlock');

const {
	getGenerators,
	getForgingStatus,
	updateForgingStatus,
	invokeEndpointProxy,
	getSchemas,
	getRegisteredActions,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
	getSystemMetadata,
} = require('./endpoints');

const {
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
} = require('./peers');

const {
	getTokenBalance,
	getTokenBalances,
	getEscrowedAmounts,
	getSupportedTokens,
	getTotalSupply,
} = require('./tokens');

const {
	getDelegate,
	getAllDelegates,
	getPoSConstants,
	getStaker,
} = require('./pos');

const {
	getFeeTokenID,
	getMinFeePerByte,
	cacheFeeConstants,
} = require('./fee');

const { getAuthAccount } = require('./auth');
const { getLegacyAccount } = require('./legacy');
const { getEventsByHeight } = require('./events');
const { setSchemas, setMetadata } = require('./schema');
const { getValidator, validateBLSKey } = require('./validators');
const { refreshNetworkStatus, getNetworkStatus } = require('./network');

const init = async () => {
	// Initialize the local cache
	await refreshNetworkStatus();
	await cacheFeeConstants();

	// Cache all the schemas
	setSchemas(await getSchemas());
	setMetadata(await getSystemMetadata());

	// Download the genesis block, if applicable
	await getGenesisBlock();
};

module.exports = {
	init,

	getLastBlock,
	getBlockByID,
	getBlocksByIDs,
	getBlockByHeight,
	getBlocksByHeightBetween,

	getEventsByHeight,

	getTransactionByID,
	getTransactionsByIDs,
	getTransactionsFromPool,
	postTransaction,
	dryRunTransaction,

	getFeeTokenID,
	getMinFeePerByte,

	getGenesisHeight,
	getGenesisBlockID,
	getGenesisBlock,
	getGenesisConfig,

	getGenerators,
	getForgingStatus,
	updateForgingStatus,

	getNetworkStatus,

	invokeEndpointProxy,
	getSchemas,
	getRegisteredActions,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
	getSystemMetadata,

	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,

	getTokenBalance,
	getTokenBalances,
	getEscrowedAmounts,
	getSupportedTokens,
	getTotalSupply,

	getDelegate,
	getAllDelegates,
	getPoSConstants,
	getStaker,

	getAuthAccount,

	getValidator,
	validateBLSKey,

	getLegacyAccount,
};
