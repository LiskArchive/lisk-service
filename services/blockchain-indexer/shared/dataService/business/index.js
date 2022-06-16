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
	getAccounts,
	getMultisignatureGroups,
	getMultisignatureMemberships,
	getAccountsByAddress,
	getAccountsByPublicKey,
	getAccountsByPublicKey2,
	getIndexedAccountInfo,
	getAccountsBySearch,
	resolveMultisignatureMemberships,
	getNumberOfForgers,
} = require('./accounts');

const {
	getBlocks,
	getGenesisHeight,
	getFinalizedHeight,
	normalizeBlocks,
	getLastBlock,
	getBlockByHeight,
	getBlockByID,
	getBlocksAssets,
} = require('./blocks');

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

const { getTokensInfo } = require('./token');

const {
	getTransactions,
	getTransactionsByBlockIDs,
	getTransactionsByBlockId,
	getTransactionsByIDs,
	normalizeTransaction,
} = require('./transactions');

const {
	getCommandsParamsSchemas,
} = require('./commandsParamsSchemas');

const {
	getVotesByTransactionIDs,
} = require('./voters');

const {
	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountBySecondPublicKey,
	getCachedAccountByUsername,
} = require('./coreCache');

module.exports = {
	getAccounts,
	getMultisignatureGroups,
	getMultisignatureMemberships,
	getAccountsByAddress,
	getAccountsByPublicKey,
	getAccountsByPublicKey2,
	getIndexedAccountInfo,
	getAccountsBySearch,
	resolveMultisignatureMemberships,
	getNumberOfForgers,
	getBlocks,
	getGenesisHeight,
	getFinalizedHeight,
	normalizeBlocks,
	getLastBlock,
	getBlockByHeight,
	getBlockByID,
	getBlocksAssets,
	getDelegates,
	getAllDelegates,
	isDposModuleRegistered,
	getGenerators,
	getNumberOfGenerators,
	postTransactions,
	getTokensInfo,
	getPendingTransactions,
	loadAllPendingTransactions,
	getTransactions,
	getTransactionsByBlockIDs,
	getTransactionsByBlockId,
	getTransactionsByIDs,
	getCommandsParamsSchemas,
	normalizeTransaction,
	getVotesByTransactionIDs,
	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountBySecondPublicKey,
	getCachedAccountByUsername,
};
