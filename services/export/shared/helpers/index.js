/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
	validateLisk32Address,
	validatePublicKey,
	getLisk32AddressFromPublicKey,
	getLegacyAddress,
} = require('./account');

const {
	getCurrentChainID,
	resolveReceivingChainID,
	getNetworkStatus,
	getUniqueChainIDs,
} = require('./chain');

const {
	MODULE,
	COMMAND,
	EVENT,
	MODULE_SUB_STORE,
} = require('./constants');

const {
	init,
	write,
	read,
	remove,
	list,
	purge,
	exists,
	isFile,
	isFilePathInDirectory,
} = require('./file');

const {
	setAppContext,
	requestIndexer,
	requestConnector,
	requestAppRegistry,
} = require('./request');

const {
	getDaysInMilliseconds,
	dateFromTimestamp,
	timeFromTimestamp,
} = require('./time');

const {
	normalizeTransactionAmount,
	normalizeTransactionFee,
	checkIfSelfTokenTransfer,
} = require('./transaction');

module.exports = {
	validateLisk32Address,
	validatePublicKey,
	getLisk32AddressFromPublicKey,
	getLegacyAddress,

	getCurrentChainID,
	resolveReceivingChainID,
	getNetworkStatus,
	getUniqueChainIDs,

	MODULE,
	COMMAND,
	EVENT,
	MODULE_SUB_STORE,

	init,
	write,
	read,
	remove,
	list,
	purge,
	exists,
	isFile,
	isFilePathInDirectory,

	setAppContext,
	requestIndexer,
	requestConnector,
	requestAppRegistry,

	getDaysInMilliseconds,
	dateFromTimestamp,
	timeFromTimestamp,

	normalizeTransactionAmount,
	normalizeTransactionFee,
	checkIfSelfTokenTransfer,
};
