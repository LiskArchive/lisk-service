// /*
//  * LiskHQ/lisk-service
//  * Copyright © 2021 Lisk Foundation
//  *
//  * See the LICENSE file at the top-level directory of this distribution
//  * for licensing information.
//  *
//  * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
//  * no part of this software, including this file, may be copied, modified,
//  * propagated, or distributed except according to the terms contained in the
//  * LICENSE file.
//  *
//  * Removal or modification of this copyright notice is prohibited.
//  *
//  */
const {
	getAddressFromPublicKey,
	getBase32AddressFromAddress,
} = require('@liskhq/lisk-cryptography');

const accountsIndexSchema = require('./schema/accounts');

const { getTableInstance } = require('../database/mysql');

const getAccountsIndex = () => getTableInstance('accounts', accountsIndexSchema);

const getIndexedAccountInfo = async (params, columns) => {
	if (!('publicKey' in params) || params.publicKey) {
		const accountsDB = await getAccountsIndex();
		const [account] = await accountsDB.find(params, columns);
		return account;
	}
	return {};
};

const getHexAddressFromPublicKey = publicKey => {
	const binaryAddress = getAddressFromPublicKey(Buffer.from(publicKey, 'hex'));
	return binaryAddress.toString('hex');
};

const getBase32AddressFromHex = address => {
	const base32Address = getBase32AddressFromAddress(Buffer.from(address, 'hex'));
	return base32Address;
};

const getBase32AddressFromPublicKey = publicKey => {
	const hexAddress = getHexAddressFromPublicKey(publicKey);
	const base32Address = getBase32AddressFromHex(hexAddress);
	return base32Address;
};

module.exports = {
// 	validateAddress,
// 	validatePublicKey,
// 	confirmAddress,
// 	confirmPublicKey,
	getIndexedAccountInfo,
	// 	getAccountsBySearch,
	// 	getLegacyAddressFromPublicKey: getLegacyFormatAddressFromPublicKey,
	// 	getLegacyHexAddressFromPublicKey,
	getHexAddressFromPublicKey,
	getBase32AddressFromHex,
	// 	getHexAddressFromBase32,
	getBase32AddressFromPublicKey,
};
