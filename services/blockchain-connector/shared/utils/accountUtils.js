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
	address: {
		getLisk32AddressFromPublicKey: getLisk32AddressFromPublicKeyHelper,
		getLisk32AddressFromAddress,
	},
	legacyAddress: {
		getLegacyAddressFromPublicKey,

	},
} = require('@liskhq/lisk-cryptography');

const getLegacyFormatAddressFromPublicKey = publicKey => {
	const legacyAddress = getLegacyAddressFromPublicKey(Buffer.from(publicKey, 'hex'));
	return legacyAddress;
};

const getLisk32AddressFromPublicKey = publicKey => getLisk32AddressFromPublicKeyHelper(Buffer.from(publicKey, 'hex'));

const getLisk32AddressFromHexAddress = address => getLisk32AddressFromAddress(Buffer.from(address, 'hex'));

// TODO: Remove once SDK returns address in Lisk32 format
const getLisk32Address = address => address.startsWith('lsk') ? address : getLisk32AddressFromHexAddress(address);

module.exports = {
	getLegacyAddressFromPublicKey: getLegacyFormatAddressFromPublicKey,
	getLisk32AddressFromPublicKey,
	getLisk32AddressFromHexAddress,
	getLisk32Address,
};
