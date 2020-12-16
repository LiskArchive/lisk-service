/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
	getBlocks,
	setLastBlock,
	getLastBlock,
	waitForLastBlock,
	reloadBlocks,
} = require('./blocks');

const {
	getTransactions,
	getPendingTransactions,
	reloadAllPendingTransactions,
} = require('./transactions');

const {
	getAccounts,
} = require('./accounts');

const {
	reloadDelegateCache,
	getTotalNumberOfDelegates,
	getDelegates,
	reloadNextForgersCache,
	getNextForgers,
} = require('./delegates');

const {
	getUsernameByAddress,
	getAddressByUsername,
} = require('./delegateUtils');

const {
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
} = require('./peers');

const {
	getVoters,
} = require('./voters');

const {
	getEstimateFeeByte,
	calculateEstimateFeeByte,
} = require('./dynamicFees');

const {
	getVotes,
} = require('./votes');

const {
	get,
	parseAddress,
	validateAddress,
	validatePublicKey,
	confirmAddress,
	confirmPublicKey,
	confirmSecondPublicKey,
	confirmUsername,
	confirmAnyId,
	getAddressByAny,
	getAddressByPublicKey,
	getPublicKeyByAny,
	getPublicKeyByAddress,
	getPublicKeyByUsername,
	getMultisignatureGroups,
	getMultisignatureMemberships,
	getIncomingTxsCount,
	getOutgoingTxsCount,
	getForgingStats,
	getNetworkStatus,
	getNetworkConstants,
	numOfActiveDelegates,
	peerStates,
	setReadyStatus,
	setCoreVersion,
	getCoreVersion,
	getReadyStatus,
	getEpochUnixTime,
	getUnixTime,
	updateFinalizedHeight,
	getSDKVersion,
} = require('./compat');

const events = require('./events');

module.exports = {
	get,
	parseAddress,
	validateAddress,
	validatePublicKey,
	confirmAddress,
	confirmPublicKey,
	confirmSecondPublicKey,
	confirmUsername,
	confirmAnyId,
	getAddressByAny,
	getAddressByPublicKey,
	getAddressByUsername,
	getPublicKeyByAny,
	getPublicKeyByAddress,
	getPublicKeyByUsername,
	getUsernameByAddress,
	getAccounts,
	getBlocks,
	getTransactions,
	getMultisignatureGroups,
	getMultisignatureMemberships,
	getIncomingTxsCount,
	getOutgoingTxsCount,
	getVotes,
	getVoters,
	getDelegates,
	reloadDelegateCache,
	getTotalNumberOfDelegates,
	getForgingStats,
	reloadNextForgersCache,
	getNextForgers,
	getNetworkStatus,
	getNetworkConstants,
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
	numOfActiveDelegates,
	peerStates,
	setReadyStatus,
	setCoreVersion,
	getCoreVersion,
	getReadyStatus,
	getEpochUnixTime,
	getUnixTime,
	getEstimateFeeByte,
	calculateEstimateFeeByte,
	setLastBlock,
	getLastBlock,
	reloadBlocks,
	updateFinalizedHeight,
	getPendingTransactions,
	reloadAllPendingTransactions,
	events,
	getSDKVersion,
	waitForLastBlock,
};
