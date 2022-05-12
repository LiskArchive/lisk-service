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
const Redis = require('ioredis');

const Queue = require('../../queue');

const {
	getTableInstance,
} = require('../../../indexdb/mysql');

const {
	getAccountsByAddress,
	getAccountsByPublicKey2,
} = require('./accounts');

const config = require('../../../../config');

const redis = new Redis(config.endpoints.redis);

const accountsIndexSchema = require('./schema/accounts');

const getAccountIndex = () => getTableInstance('accounts', accountsIndexSchema);

const updateAccountInfoPk = async (job) => {
	const publicKey = job.data;

	const accounts = await getAccountsByPublicKey2([publicKey]);
	if (accounts.length) {
		const accountsDB = await getAccountIndex();
		await accountsDB.upsert(accounts);
	}
};

const updateAccountInfoAddr = async (job) => {
	const address = job.data;

	const accounts = await getAccountsByAddress([address]);
	if (accounts.length) {
		const accountsDB = await getAccountIndex();
		await accountsDB.upsert(accounts);
	}
};

const updateAccountWithData = async (job) => {
	const accounts = job.data;

	const accountsDB = await getAccountIndex();
	await accountsDB.upsert(accounts);
};

const accountPkUpdateQueue = Queue('accountQueueByPublicKey', updateAccountInfoPk, 1);
const accountAddrUpdateQueue = Queue('accountQueueByAddress', updateAccountInfoAddr, 1);
const accountDirectUpdateQueue = Queue('accountQueueDirect', updateAccountWithData, 1);

const indexAccountByPublicKey = async (publicKey) => redis.sadd('pendingAccountsByPublicKey', publicKey);

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

const indexAccountWithData = async (account) => accountDirectUpdateQueue.add(account);

module.exports = {
	indexAccountByPublicKey,
	indexAccountByAddress,
	indexAccountWithData,
	triggerAccountUpdates,
};
