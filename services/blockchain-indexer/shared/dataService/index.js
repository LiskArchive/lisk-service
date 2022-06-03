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
	getMultisignatureGroups,
	getMultisignatureMemberships,
	getAccountsByAddress,
	getAccountsByPublicKey,
	getAccountsByPublicKey2,
	getIndexedAccountInfo,
	getAccountsBySearch,
	resolveMultisignatureMemberships,
	getNumberOfForgers,
	getGenesisHeight,
	getFinalizedHeight,
	normalizeBlocks,
	getBlockByHeight,
	getBlockByID,
	loadAllPendingTransactions,
	getTransactionsByBlockIDs,
	getTransactionsByIDs,
	normalizeTransaction,
	getVotesByTransactionIDs,
	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountBySecondPublicKey,
	getCachedAccountByUsername,
} = require('./business');

const { getAccounts } = require('./accounts');

const {
	getBlocks,
	getBlocksAssets,
	setLastBlock,
	getLastBlock,
	waitForLastBlock,
	getTotalNumberOfBlocks,
	performLastBlockUpdate,
} = require('./blocks');

const {
	reloadDelegateCache,
	getTotalNumberOfDelegates,
	getDelegates,
	reloadNextForgersCache,
	getForgers,
} = require('./delegates');

const { getNetworkStatus } = require('./network');

const {
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
} = require('./peers');

const {
	getTransactions,
	getPendingTransactions,
	reloadAllPendingTransactions,
	postTransactions,
	getCommandsParamsSchemas,
	getTransactionsByBlockId,
} = require('./transactions');

const { getVoters } = require('./voters');

const { getVotes } = require('./votes');

module.exports = {
	getAllDelegates,
	getMultisignatureGroups,
	getMultisignatureMemberships,
	getAccountsByAddress,
	getAccountsByPublicKey,
	getAccountsByPublicKey2,
	getIndexedAccountInfo,
	getAccountsBySearch,
	resolveMultisignatureMemberships,
	getNumberOfForgers,
	getGenesisHeight,
	getFinalizedHeight,
	normalizeBlocks,
	getBlockByHeight,
	getBlockByID,
	getForgers,
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
	loadAllPendingTransactions,
	getTransactionsByBlockIDs,
	getTransactionsByIDs,
	normalizeTransaction,
	getVotesByTransactionIDs,
	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountBySecondPublicKey,
	getCachedAccountByUsername,

	getAccounts,
	getBlocks,
	getBlocksAssets,
	setLastBlock,
	getLastBlock,
	waitForLastBlock,
	getTotalNumberOfBlocks,
	performLastBlockUpdate,
	reloadDelegateCache,
	getTotalNumberOfDelegates,
	getDelegates,
	reloadNextForgersCache,
	getNetworkStatus,
	getTransactions,
	getPendingTransactions,
	reloadAllPendingTransactions,
	postTransactions,
	getCommandsParamsSchemas,
	getTransactionsByBlockId,
	getVoters,
	getVotes,

};
