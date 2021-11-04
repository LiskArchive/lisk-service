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
const POOL_LIMIT = 64;

const hasMinimalBalance = account => {
	return true;
};

const isMultisigAccount = account => {
	return true;
};

const isWithinExpirationTime = transaction => {
	return true;
};

const isMultisigRegistration = transaction => {
	return true;
};

const isWithinPoolLimit = transaction => {
	return true;
};

const hasValidServiceId = transaction => {
	return true;
};

const isValidCoreTransaction = transaction => {
	return true;
};

const hasValidSignatures = transaction => {
	return true;
};

const hasValidNonce = transaction => {
	return true;
};

module.exports = {
	// Account
	hasMinimalBalance,
	isMultisigAccount,
	
	// Transaction
	isWithinExpirationTime,
	isMultisigRegistration,
	isWithinPoolLimit,
	hasValidServiceId,
	isValidCoreTransaction,
	hasValidSignatures,
	hasValidNonce,
};
