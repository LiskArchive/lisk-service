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
	isValidCoreTransaction,
	isValidSignature,
	hasValidNonce,
} = require('../../shared/validators');

const {
	transactions,
	inputTransaction,
	// inputTransactionServiceId,
} = require('../constants/multisignature');

const { convertToCoreTransaction } = require('../../shared/transactionUtils');

const genericTransaction = inputTransaction;

const registrationTransaction = transactions[1];

const genericAccount = {
	address: 'lskved5acuxcjo6bsvj7rggxkw9dnzca9tpf2h93d',
	token: {
		balance: 10000000000,
	},
	sequence: {
		nonce: 0,
	},
	keys: {
		numberOfSignatures: 0,
		mandatoryKeys: [],
		optionalKeys: [],
	},
	dpos: {
		delegate: {
			username: '',
			pomHeights: [],
			consecutiveMissedBlocks: 0,
			lastForgedHeight: 0,
			isBanned: false,
			totalVotesReceived: '0',
		},
		sentVotes: [],
		unlocking: [],
	},
	isDelegate: false,
	isMultisignature: false,
	isGenesisAccount: 0,
	publicKey: null,
	multisignatureGroups: {
		isMultisignature: false,
	},
	multisignatureMemberships: {
		memberships: [],
	},
	knowledge: {},
};

const genericSignature = {
	publicKey: genericAccount.publicKey,
	address: genericAccount.address,
	signature: '123456',
};

// const coreTransaction = convertToCoreTransaction(genericTransaction);

const getCurrentTimestamp = () => (new Date()).getTime();

describe('Test validator', () => {
	beforeAll(async () => {});

	afterAll(async () => {});

	// This can be tested only in conjunction with Core Microservice
	// TODO: Mock Core Microservice
	xit('for minimal balance', async () => {
		expect(await hasMinimalBalance({ ...genericAccount, balance: 7500000 })).toBe(true);
		expect(await hasMinimalBalance({ ...genericAccount, balance: 150 })).toBe(false);
	});

	it('for account being a multisignature account', async () => {
		expect(isMultisigAccount({ ...genericAccount, isMultisignature: true })).toBe(true);
		expect(isMultisigAccount({ ...genericAccount, isMultisignature: false })).toBe(false);
	});

	it('for expiration time', async () => {
		expect(isWithinExpirationTime(
			{ ...genericTransaction, expires: getCurrentTimestamp() + 5000 }))
			.toBe(true);
		expect(isWithinExpirationTime(
			{ ...genericTransaction, expires: getCurrentTimestamp() - 100 }))
			.toBe(false);
	});

	it('for moduleAssetId matching multisig registration type', async () => {
		expect(isMultisigRegistration({ ...registrationTransaction, moduleAssetId: '4:0' })).toBe(true);
		expect(isMultisigRegistration({ ...registrationTransaction, moduleAssetId: '2:0' })).toBe(false);
	});

	// TODO: Mock MySQL database
	xit('for number of transactions per account within the limit of 64', async () => {
		expect(isWithinPoolLimit(genericAccount.address)).toBe(true);
		expect(isWithinPoolLimit('lskved5acuxcjo6bsvj7rggxkw9dnzca9tpf2h92d')).toBe(false);
	});

	it('for transaction containing a valid serviceId', async () => {
		expect(hasValidServiceId({ ...genericTransaction, serviceId: '7328a536b56942ae5005c31fe0cba6e46dd98ab79e7511eefc3740cead0f37fb' })).toBe(true);
		expect(hasValidServiceId({ ...genericTransaction, serviceId: 'abcdef' })).toBe(false);
	});

	// TODO: Mock getAssetSchema()
	// xit('for transaction validation using lisk-elements', async () => {
	// 	expect(isValidCoreTransaction(convertToCoreTransaction(genericTransaction))).toBe(true);
	// 	expect(isValidCoreTransaction(convertToCoreTransaction(genericTransaction))).toBe(false);
	// });

	// it('for signature validation', async () => {
	// 	expect(isValidSignature(coreTransaction, genericSignature)).toBe(true);
	// 	expect(isValidSignature(coreTransaction,
	// 		{ ...genericSignature, signature: 'invalid_signature' }))
	// 		.toBe(false);
	// });

	it('for having a valid nonce account', async () => {
		expect(hasValidNonce(
			{ ...genericTransaction, nonce: 2 },
			{ ...genericAccount, nonce: 2 }))
			.toBe(true);
		expect(hasValidNonce(
			{ ...genericTransaction, sequence: { nonce: 12 } },
			{ ...genericAccount, sequence: { nonce: 3 } }))
			.toBe(false);
	});
});
