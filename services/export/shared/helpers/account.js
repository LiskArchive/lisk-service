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
	address: {
		getAddressFromPublicKey,
		getLisk32AddressFromAddress,
	},
} = require('@liskhq/lisk-cryptography');

const validateAddress = address => (typeof address === 'string' && (/^lsk[a-hjkm-z2-9]{38}$/g).test(address));

const validatePublicKey = publicKey => (typeof publicKey === 'string' && (/^([A-Fa-f0-9]{2}){32}$/g).test(publicKey));

const getHexAddressFromPublicKey = publicKey => {
	const binaryAddress = getAddressFromPublicKey(Buffer.from(publicKey, 'hex'));
	return binaryAddress.toString('hex');
};

const getBase32AddressFromHex = address => {
	const base32Address = getLisk32AddressFromAddress(Buffer.from(address, 'hex'));
	return base32Address;
};

const getBase32AddressFromPublicKey = publicKey => {
	const hexAddress = getHexAddressFromPublicKey(publicKey);
	const base32Address = getBase32AddressFromHex(hexAddress);
	return base32Address;
};

module.exports = {
	validateAddress,
	validatePublicKey,
	getHexAddressFromPublicKey,
	getBase32AddressFromHex,
	getBase32AddressFromPublicKey,
};
