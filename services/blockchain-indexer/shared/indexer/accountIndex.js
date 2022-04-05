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
const genesisAccountPageCached = 'genesisAccountPageCached';
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

const indexAllDelegateAccounts = async () => {
	const accountsDB = await getAccountIndex();
	const allDelegatesInfo = await requestRpc('invokeAction', { action: 'dpos:getAllDelegates', params: {} });
	const allDelegateAddresses = allDelegatesInfo.map(({ address }) => address);
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

const performGenesisAccountsIndexing = async () => {
	const accountsDB = await getAccountIndex();

	const [genesisBlock] = await getBlockByHeight(await getGenesisHeight(), true);
	const genesisAccountsToIndex = genesisBlock.asset.accounts
		.filter(account => account.address.length === 40)
		.map(account => account.address);

	logger.info(`${genesisAccountsToIndex.length} registered accounts found in the genesis block`);

	const lastCachedPage = await keyValueDB.get(genesisAccountPageCached) || 0;

	const PAGE_SIZE = 1000;
	const NUM_PAGES = Math.ceil(genesisAccountsToIndex.length / PAGE_SIZE);
	for (let pageNum = 0; pageNum < NUM_PAGES; pageNum++) {
		/* eslint-disable no-await-in-loop */
		const currentPage = pageNum * PAGE_SIZE;
		const nextPage = (pageNum + 1) * PAGE_SIZE;
		const percentage = (Math.round(((pageNum + 1) / NUM_PAGES) * 1000) / 10).toFixed(1);

		if (pageNum >= lastCachedPage) {
			const genesisAccountAddressesToIndex = genesisAccountsToIndex.slice(currentPage, nextPage);

			logger.info(`Attempting retrieval of genesis accounts batch ${pageNum + 1}/${NUM_PAGES} (${percentage}%)`);

			const accounts = await getAccountsByAddress(genesisAccountAddressesToIndex, true);
			if (accounts.length) await accountsDB.upsert(accounts);
			await keyValueDB.set(genesisAccountPageCached, pageNum);

			// Update MySQL based KV-store to avoid re-indexing of the genesis accounts
			// after applying the DB snapshots
			if (pageNum === NUM_PAGES - 1) {
				logger.info('Setting genesis account indexing completion status');
				await keyValueDB.set(isGenesisAccountIndexingFinished, true);
			}
		} else {
			logger.info(`Skipping retrieval of genesis accounts batch ${pageNum + 1}/${NUM_PAGES} (${percentage}%)`);
		}
		/* eslint-enable no-await-in-loop */
	}
};

const indexGenesisAccounts = async () => {
	if (await keyValueDB.get(isGenesisAccountIndexingFinished)) {
		logger.info('Skipping genesis account index update (one-time operation, already indexed)');
		return;
	}

	try {
		// Ensure genesis accounts indexing continues even after the Api client is re-instantiated
		// Remove the listener after the genesis accounts are successfully indexed
		logger.info('Attempting to update genesis account index (one-time operation)');
		Signals.get('newApiClient').add(performGenesisAccountsIndexing);
		await performGenesisAccountsIndexing();
		Signals.get('newApiClient').remove(performGenesisAccountsIndexing);
	} catch (err) {
		logger.fatal('Critical error: Unable to index Genesis block accounts batch. Will retry after the restart');
		logger.fatal(err.message);
		process.exit(1);
	}
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
	indexGenesisAccounts,
};
