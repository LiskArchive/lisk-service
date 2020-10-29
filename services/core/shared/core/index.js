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
	cleanFromForks,
	reloadBlocks,
} = require('./blocks');
const { getTransactions } = require('./transactions');
const { getAccounts, retrieveTopAccounts } = require('./accounts');

const {
	EMAcalc,
	getEstimateFeeByte,
	getEstimateFeeByteCoreLogic,
	getTransactionInstanceByType,
	calculateBlockSize,
	calculateFeePerByte,
	calcAvgFeeByteModes,
	calculateAvgFeePerByte,
	calculateWeightedAvg,
} = require('./dynamicFees');

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
	getAddressByUsername,
	getPublicKeyByAny,
	getPublicKeyByAddress,
	getPublicKeyByUsername,
	getUsernameByAddress,
	getMultisignatureGroups,
	getMultisignatureMemberships,
	getIncomingTxsCount,
	getOutgoingTxsCount,
	getVotes,
	getVoters,
	getDelegates,
	getForgingStats,
	getNextForgers,
	getNetworkStatus,
	getNetworkConstants,
	getPeers,
	numOfActiveDelegates,
	peerStates,
	setReadyStatus,
	setCoreVersion,
	getCoreVersion,
	getReadyStatus,
	getEpochUnixTime,
	getUnixTime,
	getTotalNumberOfDelegates,
	getDelegateRankByUsername,
	reloadDelegateCache,
} = require('./compat');


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
	getForgingStats,
	getNextForgers,
	getNetworkStatus,
	getNetworkConstants,
	getPeers,
	numOfActiveDelegates,
	peerStates,
	setReadyStatus,
	setCoreVersion,
	getCoreVersion,
	getReadyStatus,
	getEpochUnixTime,
	getUnixTime,
	EMAcalc,
	getEstimateFeeByte,
	getEstimateFeeByteCoreLogic,
	getTransactionInstanceByType,
	calculateBlockSize,
	calculateFeePerByte,
	calcAvgFeeByteModes,
	calculateAvgFeePerByte,
	calculateWeightedAvg,
	getTotalNumberOfDelegates,
	getDelegateRankByUsername,
	reloadDelegateCache,
	setLastBlock,
	getLastBlock,
	reloadBlocks,
	cleanFromForks,
	retrieveTopAccounts,
};
