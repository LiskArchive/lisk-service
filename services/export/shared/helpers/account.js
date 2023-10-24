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
	utils: { hash },
	address: { getLisk32AddressFromPublicKey: getLisk32AddressFromPublicKeyHelper },
	legacyAddress: { getFirstEightBytesReversed },
} = require('@liskhq/lisk-cryptography');

const { PUBLIC_KEY, ADDRESS_LISK32 } = require('../regex');

const validateLisk32Address = address =>
	typeof address === 'string' && ADDRESS_LISK32.test(address);

const validatePublicKey = publicKey => typeof publicKey === 'string' && PUBLIC_KEY.test(publicKey);

const getLisk32AddressFromPublicKey = publicKey =>
	getLisk32AddressFromPublicKeyHelper(Buffer.from(publicKey, 'hex'));

const getLegacyAddress = publicKey =>
	getFirstEightBytesReversed(hash(Buffer.from(publicKey, 'hex'))).toString('hex');

module.exports = {
	validateLisk32Address,
	validatePublicKey,
	getLisk32AddressFromPublicKey,
	getLegacyAddress,
};
