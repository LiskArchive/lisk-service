/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const events = require('./events');

const {
	getBlocks,
	getGenesisHeight,
	getIndexStartHeight,
	updateFinalizedHeight,
	getFinalizedHeight,
} = require('./blocks');

const blockInit = require('./blocks').init;

const {
	deleteBlock,
	indexMissingBlocks,
} = require('./blockchainIndex');

const blockchainIndexInit = require('./blockchainIndex').init;

const {
	getAccounts,
	getDelegates,
	getMultisignatureGroups,
	getMultisignatureMemberships,
	validateAddress,
} = require('./accounts');

const {
	getBase32AddressFromHex,
	getBase32AddressFromPublicKey,
	getHexAddressFromBase32,
} = require('./accountUtils');

const {
	getNetworkStatus,
} = require('./network');

const {
	getTransactions,
	getTransactionsByBlockId,
} = require('./transactions');

const {
	postTransactions,
} = require('./postTransactions');

const {
	getTransactionsSchemas,
} = require('./transactionsSchemas');

const {
	getForgers,
} = require('./forgers');
const {
	peerStates,
	getPeers,
} = require('./peers');

const {
	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountBySecondPublicKey,
	getCachedAccountByUsername,
} = require('./coreCache');

const {
	getEstimateFeeByteForBatch,
} = require('./dynamicFees');

const {
	getVotes,
} = require('./votes');

const {
	getVoters,
} = require('./voters');

const {
	getPendingTransactions,
	loadAllPendingTransactions,
} = require('./pendingTransactions');

const nop = () => { };

const init = async () => {
	await blockInit();
	await blockchainIndexInit();
};

module.exports = {
	...require('./coreCache'),

	events,

	init,
	getBlocks,
	deleteBlock,
	getGenesisHeight,
	getIndexStartHeight,
	indexMissingBlocks,
	updateFinalizedHeight,
	getFinalizedHeight,

	getAccounts,
	getBase32AddressFromHex,
	getBase32AddressFromPublicKey,
	getHexAddressFromBase32,
	getMultisignatureGroups,
	getMultisignatureMemberships,
	validateAddress,

	getNetworkStatus,

	getTransactions,
	getTransactionsByBlockId,

	postTransactions,

	getTransactionsSchemas,

	getPendingTransactions,
	loadAllPendingTransactions,

	peerStates,
	getPeers,

	getForgers,

	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountBySecondPublicKey,
	getCachedAccountByUsername,

	getDelegates,

	getEstimateFeeByteForBatch,

	getVotes,

	getVoters,

	getIncomingTxsCount: nop,
	getOutgoingTxsCount: nop,
};
