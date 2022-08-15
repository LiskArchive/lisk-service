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
	utils: { hash },
	address: {
		getAddressFromPublicKey,
		getLisk32AddressFromAddress,
		getAddressFromLisk32Address,
	},
	legacyAddress: {
		getFirstEightBytesReversed,
		getLegacyAddressFromPublicKey,
	},
} = require('@liskhq/lisk-cryptography');

const {
	Utils,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const ObjectUtilService = Utils.Data;
const { isEmptyArray } = ObjectUtilService;

const accountsIndexSchema = require('../database/schema/accounts');

const dataService = require('../dataService');

const config = require('../../config');

const getAccountsIndex = () => getTableInstance('accounts', accountsIndexSchema, config.endpoints.mysql);

const isStringType = value => typeof value === 'string';

const parseAddress = address => isStringType(address) ? address.toUpperCase() : '';

const validateAddress = address => (typeof address === 'string' && address.match(/^lsk[a-hjkm-z2-9]{38}$/g));

const validatePublicKey = publicKey => (typeof publicKey === 'string' && publicKey.match(/^([A-Fa-f0-9]{2}){32}$/g));

const getIndexedAccountInfo = async (params, columns) => {
	if (!('publicKey' in params) || params.publicKey) {
		const accountsDB = await getAccountsIndex();
		const [account = {}] = await accountsDB.find(params, columns);
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
	const base32Address = getLisk32AddressFromAddress(Buffer.from(address, 'hex'));
	return base32Address;
};

const getHexAddressFromBase32 = address => {
	const binaryAddress = getAddressFromLisk32Address(address).toString('hex');
	return binaryAddress;
};

const getBase32AddressFromPublicKey = publicKey => {
	const hexAddress = getHexAddressFromPublicKey(publicKey);
	const base32Address = getBase32AddressFromHex(hexAddress);
	return base32Address;
};

const confirmAddress = async address => {
	if (!address || typeof address !== 'string') return false;
	const account = await dataService.getCachedAccountByAddress(parseAddress(address));
	return account && account.address.toUpperCase() === address;
};

const confirmUsername = async username => {
	if (!username || typeof username !== 'string') return false;
	const result = await dataService.getDelegates({ username });
	if (!Array.isArray(result.data) || isEmptyArray(result.data)) return false;
	return result.data[0].username === username;
};

const confirmPublicKey = async publicKey => {
	if (!publicKey || typeof publicKey !== 'string') return false;
	const account = await dataService.getCachedAccountByPublicKey(publicKey);
	return account && account.publicKey === publicKey;
};

const confirmAnyId = async params => {
	if (
		(typeof params.username === 'string' && !(await confirmUsername(params.username)))
		|| (typeof params.address === 'string' && !(await confirmAddress(parseAddress(params.address))))
		|| (typeof params.publicKey === 'string' && (!(await confirmPublicKey(params.publicKey))))
	) return false;

	return true;
};

const getUsernameByAddress = async address => {
	const account = await dataService.getCachedAccountByAddress(parseAddress(address));
	return account && account.username;
};

const getAddressByPublicKey = async publicKey => {
	if (!publicKey || typeof publicKey !== 'string') return '';
	const account = await dataService.getCachedAccountByPublicKey(publicKey);
	return account ? account.address : '';
};

const getAddressByUsername = async username => {
	if (!username || typeof username !== 'string') return '';
	const account = await dataService.getCachedAccountByUsername(username);
	return account ? account.address : '';
};

const getAddressByAny = async param => {
	const paramNames = {
		'username:': getAddressByUsername,
		'address:': parseAddress,
		'publickey:': getAddressByPublicKey,
	};

	const hasPrefix = p => !!Object.keys(paramNames).filter(item => p.indexOf(item) === 0).length;

	const separateParam = p => Object.keys(paramNames)
		.filter(prefix => p.indexOf(prefix) === 0)
		.reduce((array, prefix) => [...array, prefix, p.slice(prefix.length)], []);

	if (!hasPrefix(param)) {
		const parsedAddress = parseAddress(param);
		if (validateAddress(parsedAddress)
			&& await confirmAddress(parsedAddress)) return parsedAddress;
	}

	const [prefix, body] = separateParam(param);
	if (prefix && body) return paramNames[prefix](body);
	return null;
};

const getPublicKeyByAddress = async address => {
	if (!address || typeof address !== 'string') return '';
	const account = await dataService.getAccounts({ address });
	if (!Array.isArray(account.data) || isEmptyArray(account.data)) return '';
	return account.data[0].publicKey;
};

const getPublicKeyByUsername = async username => {
	if (!username || typeof username !== 'string') return '';
	const account = await dataService.getAccounts({ username });
	if (!Array.isArray(account.data) || isEmptyArray(account.data)) return '';
	const { publicKey } = account.data[0];
	return publicKey;
};

const getPublicKeyByAny = async param => {
	if (!param || typeof param !== 'string') return '';
	if (validatePublicKey(param) && (await confirmPublicKey(param))) return param;
	if (validateAddress(param)) return getPublicKeyByAddress(param);
	return getPublicKeyByUsername(param);
};

const updateAccountPublicKey = async (publicKey) => {
	const accountsDB = await getAccountsIndex();
	await accountsDB.upsert({
		address: getBase32AddressFromPublicKey(publicKey),
		publicKey,
	});
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
	updateAccountPublicKey,

	confirmAnyId,
	getUsernameByAddress,
	getAddressByAny,
	getPublicKeyByAny,
	getAddressByUsername,
};
