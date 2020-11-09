/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const coreApi = require('./coreApi');
const {
	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountBySecondPublicKey,
} = require('../sdk_v2');

const parseAddress = address => {
	if (typeof address !== 'string') return '';
	return address.toUpperCase();
};

const validatePublicKey = publicKey => (typeof publicKey === 'string' && publicKey.match(/^([A-Fa-f0-9]{2}){32}$/g));

const confirmAddress = async address => {
	if (!address || typeof address !== 'string') return false;
	const account = await getCachedAccountByAddress(parseAddress(address));
	return (account && account.address === address);
};

const confirmPublicKey = async publicKey => {
	if (!publicKey || typeof publicKey !== 'string') return false;
	const account = await getCachedAccountByPublicKey(publicKey);
	return (account && account.publicKey === publicKey);
};

const confirmSecondPublicKey = async secondPublicKey => {
	if (!secondPublicKey || typeof secondPublicKey !== 'string') return false;
	const account = await getCachedAccountBySecondPublicKey(secondPublicKey);
	return (account && account.secondPublicKey === secondPublicKey);
};

const getAccounts = async params => {
	const requestParams = {
		limit: params.limit,
		offset: params.offset,
		sort: params.sort,
		username: params.username,
	};

	if (params.address && typeof params.address === 'string') {
		const parsedAddress = parseAddress(params.address);
		if (!(await confirmAddress(parsedAddress))) return {};
		requestParams.address = parsedAddress;
	}
	if (params.publicKey && typeof params.publicKey === 'string') {
		if (
			!validatePublicKey(params.publicKey)
			|| !(await confirmPublicKey(params.publicKey))
		) {
			return {};
		}
		requestParams.publicKey = params.publicKey;
	}
	if (params.secondPublicKey && typeof params.secondPublicKey === 'string') {
		if (
			!validatePublicKey(params.secondPublicKey)
			|| !(await confirmSecondPublicKey(params.secondPublicKey))
		) {
			return {};
		}
		requestParams.secondPublicKey = params.secondPublicKey;
	}

	const result = await coreApi.getAccounts(requestParams);
	return result;
};


module.exports = { getAccounts };
