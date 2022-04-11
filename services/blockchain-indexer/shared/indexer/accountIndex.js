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
const BluebirdPromise = require('bluebird');
const Redis = require('ioredis');

const {
	Queue,
	CacheRedis,
	Logger,
} = require('lisk-service-framework');

const {
	getTableInstance,
} = require('../database/mysql');

const {
	getAccountsByAddress,
	getAccountsByPublicKey2,
} = require('../accounts');

const {
	getBlockByHeight,
} = require('../blocks');

const {
	getGenesisHeight,
} = require('../constants');

const { requestRpc } = require('../utils/appContext');

const config = require('../../config');
const keyValueDB = require('../database/mysqlKVStore');
const Signals = require('../utils/signals');

const redis = new Redis(config.endpoints.redis);

const accountsIndexSchema = require('./schema/accounts');

const getAccountIndex = () => getTableInstance('accounts', accountsIndexSchema);

const legacyAccountCache = CacheRedis('legacyAccount', config.endpoints.redis);

// Key constants for the KV-store
const isGenesisAccountIndexingFinished = 'isGenesisAccountIndexingFinished';

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

const accountPkUpdateQueue = Queue(config.endpoints.redis, 'accountQueueByPublicKey', updateAccountInfoPk, 1);
const accountAddrUpdateQueue = Queue(config.endpoints.redis, 'accountQueueByAddress', updateAccountInfoAddr, 1);
const accountDirectUpdateQueue = Queue(config.endpoints.redis, 'accountQueueDirect', updateAccountWithData, 1);

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

const buildLegacyAccountCache = async () => {
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

const getNumberOfGenesisAccounts = async () => requestRpc('getNumberOfGenesisAccounts');

const getGenesisAccountAddresses = async (includeLegacy = false) => {
	let genesisAccounts = [];
	const PAGE_SIZE = 100;
	const numOfGenesisAccounts = await getNumberOfGenesisAccounts();

	for (let i = 0; i <= numOfGenesisAccounts / PAGE_SIZE; i++) {
		// eslint-disable-next-line no-await-in-loop
		const accounts = await requestRpc('getGenesisAccounts');
		const filteredAccounts = accounts.filter(a => includeLegacy || a.address.length === 40);
		genesisAccounts = genesisAccounts.concat(filteredAccounts);
	}

	const genesisAccountAddresses = genesisAccounts.map(account => account.address);
	return genesisAccountAddresses;
};

const isGenesisAccountsIndexed = async () => {
	const isIndexed = await keyValueDB.get(isGenesisAccountIndexingFinished);
	if (!isIndexed) {
		const numOfGenesisAccounts = await getNumberOfGenesisAccounts();
		const accountsDB = await getAccountIndex();
		const count = await accountsDB.count();
		if (count >= numOfGenesisAccounts) {
			await keyValueDB.set(isGenesisAccountIndexingFinished, true);
			return true;
		}
		return false;
	}
	return true;
};

const getDelegateAccounts = async () => {
	const allDelegatesInfo = await requestRpc('invokeAction', { action: 'dpos:getAllDelegates', params: {} });
	const allDelegateAddresses = allDelegatesInfo.map(({ address }) => address);
	return allDelegateAddresses;
};

const addAccountToAddrUpdateQueue = async address => accountAddrUpdateQueue.add(address);

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
	buildLegacyAccountCache,
	isGenesisAccountsIndexed,
	getDelegateAccounts,
	addAccountToAddrUpdateQueue,
	getGenesisAccountAddresses,
};
