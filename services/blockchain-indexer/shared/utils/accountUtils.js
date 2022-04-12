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
	hash,
	getFirstEightBytesReversed,
	getAddressFromPublicKey,
	getBase32AddressFromAddress,
	getAddressFromBase32Address,
	getLegacyAddressFromPublicKey,
} = require('@liskhq/lisk-cryptography');

const accountsIndexSchema = require('../indexer/schema/accounts');

const { getTableInstance } = require('../database/mysql');

const getAccountsIndex = () => getTableInstance('accounts', accountsIndexSchema);

const isStringType = value => typeof value === 'string';

const parseAddress = address => isStringType(address) ? address.toUpperCase() : '';

const validateAddress = address => (typeof address === 'string' && address.match(/^lsk[a-hjkm-z2-9]{38}$/g));

const validatePublicKey = publicKey => (typeof publicKey === 'string' && publicKey.match(/^([A-Fa-f0-9]{2}){32}$/g));

const getIndexedAccountInfo = async (params, columns) => {
	if (!('publicKey' in params) || params.publicKey) {
		const accountsDB = await getAccountsIndex();
		const [account] = await accountsDB.find(params, columns);
		return account;
	}
	return {};
};

const getAccountsBySearch = async (searchProp, searchString, columns) => {
	const accountsDB = await getAccountsIndex();
	const params = {
		search: {
			property: searchProp,
			pattern: searchString,
		},
	};
	const account = await accountsDB.find(params, columns);
	return account;
};

const getLegacyFormatAddressFromPublicKey = publicKey => {
	const legacyAddress = getLegacyAddressFromPublicKey(Buffer.from(publicKey, 'hex'));
	return legacyAddress;
};

const getLegacyHexAddressFromPublicKey = publicKey => {
	const getLegacyBytes = pk => getFirstEightBytesReversed(hash(Buffer.from(pk, 'hex')));
	const legacyHexAddress = getLegacyBytes(publicKey).toString('hex');
	return legacyHexAddress;
};

const getHexAddressFromPublicKey = publicKey => {
	const binaryAddress = getAddressFromPublicKey(Buffer.from(publicKey, 'hex'));
	return binaryAddress.toString('hex');
};

const getBase32AddressFromHex = address => {
	const base32Address = getBase32AddressFromAddress(Buffer.from(address, 'hex'));
	return base32Address;
};

const getHexAddressFromBase32 = address => {
	const binaryAddress = getAddressFromBase32Address(address).toString('hex');
	return binaryAddress;
};

const getBase32AddressFromPublicKey = publicKey => {
	const hexAddress = getHexAddressFromPublicKey(publicKey);
	const base32Address = getBase32AddressFromHex(hexAddress);
	return base32Address;
};

module.exports = {
	parseAddress,
	validateAddress,
	validatePublicKey,
	getIndexedAccountInfo,
	getAccountsBySearch,
	getLegacyAddressFromPublicKey: getLegacyFormatAddressFromPublicKey,
	getLegacyHexAddressFromPublicKey,
	getHexAddressFromPublicKey,
	getBase32AddressFromHex,
	getHexAddressFromBase32,
	getBase32AddressFromPublicKey,
};
