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
	validateAddress,
	validatePublicKey,
	getHexAddressFromPublicKey,
	getBase32AddressFromHex,
	getBase32AddressFromPublicKey,
} = require('../../shared/helpers/account');

const {
	valid,
	invalid,
} = require('../constants/account');

describe('Account utils', () => {
	describe('Validate address', () => {
		it('returns true for valid Base32 address', async () => {
			const isValid = validateAddress(valid.address);
			expect(isValid).toBe(true);
		});

		it('returns false for invalid Base32 address', async () => {
			const isInvalid = validateAddress(invalid.address);
			expect(isInvalid).toBe(false);
		});
	});

	describe('Validate publicKey', () => {
		it('returns true for valid publicKey', async () => {
			const isValid = validatePublicKey(valid.publicKey);
			expect(isValid).toBe(true);
		});

		it('returns false for invalid publicKey', async () => {
			const isInvalid = validatePublicKey(invalid.publicKey);
			expect(isInvalid).toBe(false);
		});
	});

	describe('Extract address from a valid publicKey', () => {
		it('returns correct hex address from a valid publicKey', async () => {
			const hexAddress = getHexAddressFromPublicKey(valid.publicKey);
			expect(hexAddress).toBe(valid.hexAddress);
		});

		it('returns correct base32 address from a valid hex address', async () => {
			const address = getBase32AddressFromHex(valid.hexAddress);
			expect(address).toBe(valid.address);
		});

		it('returns correct base32 address from a valid publicKey', async () => {
			const address = getBase32AddressFromPublicKey(valid.publicKey);
			expect(address).toBe(valid.address);
		});
	});
});
