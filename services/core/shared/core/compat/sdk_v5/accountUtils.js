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
	getAddressFromPublicKey,
	getBase32AddressFromAddress,
	getAddressFromBase32Address,
	getLegacyAddressFromPublicKey,
} = require('@liskhq/lisk-cryptography');

const coreCache = require('./coreCache');

const accountsIndexSchema = require('./schema/accounts');

const mysqlIndex = require('../../../indexdb/mysql');

const getAccountsIndex = () => mysqlIndex('accounts', accountsIndexSchema);

const parseAddress = address => (typeof address === 'string') ? address.toUpperCase() : '';

const validatePublicKey = publicKey => (typeof publicKey === 'string' && publicKey.match(/^([A-Fa-f0-9]{2}){32}$/g));

const confirmAddress = async address => {
	if (!address || typeof address !== 'string') return false;
	const account = await coreCache.getCachedAccountByAddress(address);
	return (account && parseAddress(account.address) === parseAddress(address));
};

const confirmPublicKey = async publicKey => {
	if (!publicKey || typeof publicKey !== 'string') return false;
	const account = await coreCache.getCachedAccountByPublicKey(publicKey);
	return (account && account.publicKey === publicKey);
};

const getIndexedAccountInfo = async (params, columns) => {
	const accountsDB = await getAccountsIndex();
	const [account] = await accountsDB.find(params, columns);
	return account;
};

const getAccountsBySearch = async (searchProp, searchString) => {
	const accountsDB = await getAccountsIndex();
	const params = {
		search: {
			property: searchProp,
			pattern: searchString,
		},
	};
	const account = await accountsDB.find(params);
	return account;
};

const getLegacyFormatAddressFromPublicKey = publicKey => {
	const legacyAddress = getLegacyAddressFromPublicKey(Buffer.from(publicKey, 'hex'));
	return legacyAddress;
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
	validatePublicKey,
	confirmAddress,
	confirmPublicKey,
	getIndexedAccountInfo,
	getAccountsBySearch,
	getLegacyAddressFromPublicKey: getLegacyFormatAddressFromPublicKey,
	getHexAddressFromPublicKey,
	getBase32AddressFromHex,
	getHexAddressFromBase32,
	getBase32AddressFromPublicKey,
};
