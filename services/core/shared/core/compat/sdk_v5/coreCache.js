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
const { Utils, CacheLRU } = require('lisk-service-framework');

const { isEmptyArray } = Utils.Data;

const config = require('../../../../config');
const { knex } = require('../../../database');

const cache = CacheLRU();
const getCacheKey = (key, value) => `account:${key}:${value}`;

const getCachedAccountBy = async (key, value) => {
	const accountsDB = await knex('accounts');
	const cacheKey = getCacheKey(key, value);
	let account = await cache.get(cacheKey);
	if (!account) {
		const result = await accountsDB.find({ [key]: value });
		if (!Array.isArray(result) || isEmptyArray(result)) {
			const expireMiliseconds = config.ttl.affectedByNewBlocks;
			await cache.set(cacheKey, null, expireMiliseconds);
			return null;
		}
		const { address, username, publicKey } = result[0];
		account = { address, username, publicKey };
		Object.entries(account).forEach(async ([k, v]) => {
			if (v) await cache.set(getCacheKey(k, v), account);
		});
	}
	return account;
};

const getCachedAccountByAddress = getCachedAccountBy.bind(null, 'address');
const getCachedAccountByPublicKey = getCachedAccountBy.bind(null, 'publicKey');
const getCachedAccountBySecondPublicKey = getCachedAccountBy.bind(null, 'secondPublicKey');
const getCachedAccountByUsername = getCachedAccountBy.bind(null, 'username');

module.exports = {
	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountBySecondPublicKey,
	getCachedAccountByUsername,
};
