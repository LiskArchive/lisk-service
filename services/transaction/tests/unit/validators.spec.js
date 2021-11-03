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
const {
	// Account
	hasMinimalBalance,
	isMultisigAccount,

	// Transaction
	isWithinExpirationTime,
	isMultisigRegistration,
	isWithinPoolLimit,
	hasValidServiceId,
	isValidTransaction,
	hasValidSignatures,
	hasValidNonce,
} = require('../../shared/validators');

const genericAccount = {
	accountId: '',
	// balance: '',
};

const accountWithEnoughBalance = { ...genericAccount, balance: 7500000 };

const accountWithLittleBalance = { ...genericAccount, balance: 150 };

const genericTransaction = {};

const transactionWithinExpiryTime = {};

const expiredTransaction = {};

const transactionInvalidModuleAssetId = {};

describe('Test validator', () => {
	beforeAll(async () => {});

	afterAll(async () => {});

	it.todo('for minimal balance', async () => {
		expect(hasMinimalBalance(accountWithEnoughBalance)).toBe(true);
		expect(hasMinimalBalance(accountWithLittleBalance)).toBe(false);
	});

	it.todo('for account being a multisignature account', () => {
		expect(isMultisigAccount(genericTransaction)).toBe(true);
		expect(isMultisigAccount(transactionInvalidModuleAssetId)).toBe(false);
	});

	it.todo('for expiration time', async () => {
		expect(isWithinExpirationTime(transactionWithinExpiryTime)).toBe(true);
		expect(isWithinExpirationTime(expiredTransaction)).toBe(false);
	});

	it.todo('for moduleAssetId matching multisig registration type', () => {
		expect(isMultisigRegistration(genericTransaction)).toBe(true);
		expect(isMultisigRegistration(transactionInvalidModuleAssetId)).toBe(false);
	});

	it.todo('for number of transactions per account within the limit of 64', () => {
		expect(isWithinPoolLimit(genericTransaction)).toBe(true);
		expect(isWithinPoolLimit(transactionInvalidModuleAssetId)).toBe(false);
	});

	it.todo('for transaction containing a valid serviceId', () => {
		expect(hasValidServiceId(genericTransaction)).toBe(true);
		expect(hasValidServiceId(transactionInvalidModuleAssetId)).toBe(false);
	});

	it.todo('for transaction validation using lisk-elements', () => {
		expect(isValidTransaction(genericTransaction)).toBe(true);
		expect(isValidTransaction(transactionInvalidModuleAssetId)).toBe(false);
	});

	it.todo('for valid signatures', () => {
		expect(hasValidSignatures(genericTransaction)).toBe(true);
		expect(hasValidSignatures(transactionInvalidModuleAssetId)).toBe(false);
	});

	it.todo('for having a valid nonce account', () => {
		expect(hasValidNonce(genericTransaction)).toBe(true);
		expect(hasValidNonce(transactionInvalidModuleAssetId)).toBe(false);
	});
});
