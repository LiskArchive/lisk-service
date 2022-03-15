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
// const {
// 	// CacheRedis,
// 	Logger,
// } = require('lisk-service-framework');

// const BluebirdPromise = require('bluebird');
const Redis = require('ioredis');

const Queue = require('../../queue');

const {
	// getDbConnection,
	getTableInstance,
	// startDbTransaction,
	// commitDbTransaction,
	// rollbackDbTransaction,
} = require('../../../indexdb/mysql');

const {
	getAccountsByAddress,
	getAccountsByPublicKey,
} = require('./accounts');

const getPublicKeyByAddress = async (address) => {
	try {
		const account = await getAccountsByAddress([address]);
		return account;
	} catch (err) {
		return null;
	}
};

const config = require('../../../../config');

const redis = new Redis(config.endpoints.redis);

const accountsIndexSchema = require('./schema/accounts');

const getAccountIndex = () => getTableInstance('accounts', accountsIndexSchema);

const updateAccountInfoPk = async (job) => {
	const { publicKey } = job.data;

	const account = await getAccountsByPublicKey([publicKey]);
	if (account.length) {
		const accountsDB = await getAccountIndex();
		await accountsDB.upsert(account);
	}
};

const updateAccountInfoAddr = async (job) => {
	const { address } = job.data;

	const account = await getAccountsByAddress([address]);
	if (account.length) {
		const accountsDB = await getAccountIndex();
		await accountsDB.upsert(account);
	}
};

const accountPkUpdateQueue = Queue('accountQueueByPublicKey', updateAccountInfoPk, 1);
const accountAddrUpdateQueue = Queue('accountQueueByAddress', updateAccountInfoAddr, 1);

const indexAccountByPublicKey = async (publicKey) => redis.sadd('pendingAccountsByPublicKey', publicKey);

// const indexAccountByAddress = async (address) => {
// 	const publicKey = await getPublicKeyByAddress(address);
// 	if (typeof publicKey === 'string') {
// 		indexAccountByPublicKey(publicKey);
// 	} else {
// 		redis.sadd('pendingAccountsByAddress', address);
// 	}
// };

const indexAccountByAddress = async (address) => redis.sadd('pendingAccountsByAddress', address);

const triggerAccountUpdates = async () => {
	const publicKeys = await redis.spop('pendingAccountsByPublicKey', 64);
	publicKeys.forEach(publicKey => {
		if (typeof publicKey === 'string') accountPkUpdateQueue.add(publicKey);
	});

	const addresses = await redis.spop('pendingAccountsByAddress', 64);
	addresses.forEach(address => {
		if (typeof address === 'string') accountAddrUpdateQueue.add(address);
	});
};

module.exports = {
	indexAccountByPublicKey,
	indexAccountByAddress,
	triggerAccountUpdates,
};
