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
const BluebirdPromise = require('bluebird');
const Redis = require('ioredis');

const {
	Queue,
	Signals,
	CacheRedis,
	Logger,
} = require('lisk-service-framework');

const {
	getTableInstance,
} = require('../database/mysql');

const {
	getAccountsByAddress,
	getAccountsByPublicKey2,
} = require('./accounts');

const {
	getBlockByHeight,
} = require('./blocks');

const {
	getGenesisHeight,
} = require('./constants');

const { getAppContext } = require('../utils/appContext');

const config = require('../../config');

const redis = new Redis(config.endpoints.redis);

const accountsIndexSchema = require('./schema/accounts');

const getAccountIndex = () => getTableInstance('accounts', accountsIndexSchema);

const legacyAccountCache = CacheRedis('legacyAccount', config.endpoints.redis);

const logger = Logger();

const updateAccountInfoPk = async (job) => {
	const publicKey = job.data;

	const account = await getAccountsByPublicKey2([publicKey]);
	if (account.length) {
		const accountsDB = await getAccountIndex();
		await accountsDB.upsert(account);
	}
};

const updateAccountInfoAddr = async (job) => {
	const address = job.data;

	const account = await getAccountsByAddress([address]);
	if (account.length) {
		const accountsDB = await getAccountIndex();
		await accountsDB.upsert(account);
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

const indexAccountWithData = (account) => accountDirectUpdateQueue.add(account);

const indexAllDelegateAccounts = async () => {
	const app = await getAppContext();
	const accountsDB = await getAccountIndex();
	const allDelegatesInfo = await app.requestRpc('connector.invokeAction', { action: 'dpos:getAllDelegates' });
	const allDelegateAddresses = allDelegatesInfo.data.map(({ address }) => address);
	const PAGE_SIZE = 1000;
	for (let i = 0; i < Math.ceil(allDelegateAddresses.length / PAGE_SIZE); i++) {
		/* eslint-disable no-await-in-loop */
		const accounts = await getAccountsByAddress(allDelegateAddresses
			.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE));
		await accountsDB.upsert(accounts);
		/* eslint-enable no-await-in-loop */
	}
	logger.info(`Indexed ${allDelegateAddresses.length} delegate accounts`);
};

const cacheLegacyAccountInfo = async () => {
	// Cache the legacy account reclaim balance information
	const [genesisBlock] = await getBlockByHeight(await getGenesisHeight(), true);
	const unregisteredAccounts = genesisBlock.asset.accounts
		.filter(account => account.address.length !== 40);

	logger.info(`${unregisteredAccounts.length} unregistered accounts found in the genesis block`);
	logger.info('Starting to cache legacy account reclaim balance information');
	await BluebirdPromise.map(
		unregisteredAccounts,
		async account => {
			const legacyAccountInfo = {
				address: account.address,
				balance: account.token.balance,
			};
			await legacyAccountCache.set(account.address, JSON.stringify(legacyAccountInfo));
		},
		{ concurrency: 1000 },
	);
	logger.info('Finished caching legacy account reclaim balance information');
};

const keepAccountsCacheUpdated = async () => {
	const accountsDB = await getAccountIndex();
	const updateAccountsCacheListener = async (address) => {
		const accounts = await getAccountsByAddress(address);
		await accountsDB.upsert(accounts);
	};
	Signals.get('updateAccountsByAddress').add(updateAccountsCacheListener);
};

Signals.get('searchIndexInitialized').add(keepAccountsCacheUpdated);

module.exports = {
	indexAccountByPublicKey,
	indexAccountByAddress,
	indexAccountWithData,
	triggerAccountUpdates,
	indexAllDelegateAccounts,
	cacheLegacyAccountInfo,
};
