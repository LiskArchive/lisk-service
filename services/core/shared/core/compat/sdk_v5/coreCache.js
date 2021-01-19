/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const { getAccounts } = require('./coreApi');

const config = require('../../../../config');

const cache = CacheLRU();
const getCacheKey = (key, value) => `account:${key}:${value}`;

const normalizeAccount = account => {
	account.address = account.address.toString('hex');
	account.token.balance = Number(account.token.balance);
	account.sequence.nonce = Number(account.sequence.nonce);
	account.dpos.sentVotes = account.dpos.sentVotes.map(vote => {
		vote.delegateAddress = vote.delegateAddress.toString('hex');
		vote.amount = Number(vote.amount);
		return vote;
	});

	return account;
};

const getCachedAccountBy = async (key, value) => {
	const cacheKey = getCacheKey(key, value);
	let account = await cache.get(cacheKey);
	if (!account) {
		const result = await getAccounts({ [key]: value });
		if (!Array.isArray(result.data) || isEmptyArray(result.data)) {
			const expireMiliseconds = config.ttl.affectedByNewBlocks;
			await cache.set(cacheKey, null, expireMiliseconds);
			return null;
		}
		const { address, dpos: { delegate: { username } } } = normalizeAccount(result.data[0]);
		account = { address, username };
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
