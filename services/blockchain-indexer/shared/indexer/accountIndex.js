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
const Redis = require('ioredis');

const {
	Queue,
	MySQL: { getTableInstance },
	Signals,
} = require('lisk-service-framework');

const {
	getAccountsByAddress,
	getAccountsByPublicKey2,
} = require('../dataService');

const config = require('../../config');

const redis = new Redis(config.endpoints.cache);

const accountsIndexSchema = require('../database/schema/accounts');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getAccountIndex = () => getTableInstance(
	accountsIndexSchema.tableName,
	accountsIndexSchema,
	MYSQL_ENDPOINT,
);

const updateAccountInfoPk = async (job) => {
	const publicKey = job.data;

	const account = await getAccountsByPublicKey2([publicKey]);
	if (account.length) {
		const accountsTable = await getAccountIndex();
		await accountsTable.upsert(account);
	}
};

const updateAccountInfoAddr = async (job) => {
	const address = job.data;

	const account = await getAccountsByAddress([address]);
	if (account.length) {
		const accountsTable = await getAccountIndex();
		await accountsTable.upsert(account);
	}
};

const updateAccountWithData = async (job) => {
	const accounts = job.data;

	const accountsTable = await getAccountIndex();
	await accountsTable.upsert(accounts);
};

const accountPkUpdateQueue = Queue(config.endpoints.cache, 'accountQueueByPublicKey', updateAccountInfoPk, 1);
const accountAddrUpdateQueue = Queue(config.endpoints.cache, 'accountQueueByAddress', updateAccountInfoAddr, 1);
const accountDirectUpdateQueue = Queue(config.endpoints.cache, 'accountQueueDirect', updateAccountWithData, 1);

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

const indexAccountWithData = (account) => accountDirectUpdateQueue.add(account);

const addAccountToAddrUpdateQueue = async address => accountAddrUpdateQueue.add(address);
const addAccountToDirectUpdateQueue = async accounts => accountDirectUpdateQueue.add(accounts);

const keepAccountsCacheUpdated = async () => {
	const accountsTable = await getAccountIndex();
	const updateAccountsCacheListener = async (address) => {
		const accounts = await getAccountsByAddress(address);
		await accountsTable.upsert(accounts);
	};
	Signals.get('updateAccountsByAddress').add(updateAccountsCacheListener);
};

Signals.get('searchIndexInitialized').add(keepAccountsCacheUpdated);

module.exports = {
	indexAccountByPublicKey,
	indexAccountByAddress,
	indexAccountWithData,
	triggerAccountUpdates,
	addAccountToAddrUpdateQueue,
	addAccountToDirectUpdateQueue,
};
