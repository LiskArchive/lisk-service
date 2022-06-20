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
const { Utils } = require('lisk-service-framework');

const ObjectUtilService = Utils.Data;
const { isEmptyArray } = ObjectUtilService;

const dataService = require('./dataService');

const isStringType = value => typeof value === 'string';

const parseAddress = address => isStringType(address) ? address.toUpperCase() : '';

const validateAddress = address => (typeof address === 'string' && address.match(/^lsk[a-hjkm-z2-9]{38}$/g));

const validatePublicKey = publicKey => (typeof publicKey === 'string' && publicKey.match(/^([A-Fa-f0-9]{2}){32}$/g));

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

const getAddressByUsername = async username => {
	if (!username || typeof username !== 'string') return '';
	const account = await dataService.getCachedAccountByUsername(username);
	return account ? account.address : '';
};

const getAddressByAny = async param => {
	const paramNames = {
		'address:': parseAddress,
	};

	const hasPrefix = p => !!Object.keys(paramNames).filter(item => p.indexOf(item) === 0).length;

	const separateParam = p => Object.keys(paramNames)
		.filter(prefix => p.indexOf(prefix) === 0)
		.reduce((array, prefix) => [...array, prefix, p.slice(prefix.length)], []);

	if (!hasPrefix(param)) {
		const parsedAddress = parseAddress(param);
		if (validateAddress(parsedAddress) && await confirmAddress(parsedAddress)) {
			return parsedAddress;
		}
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

module.exports = {
	parseAddress,
	validateAddress,
	validatePublicKey,
	confirmAnyId,
	getUsernameByAddress,
	getAddressByAny,
	getPublicKeyByAny,
	getAddressByUsername,
};
