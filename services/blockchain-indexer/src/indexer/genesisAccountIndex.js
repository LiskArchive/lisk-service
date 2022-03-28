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
const {
	Logger,
	Signals,
} = require('lisk-service-framework');

const logger = Logger();

const {
	getBlockByHeight,
} = require('./blocks');

const {
	getAccountsByAddress,
} = require('./accounts');

const { getGenesisHeight } = require('./constants');

const {
	getTableInstance,
} = require('../database/mysql');

const accountsIndexSchema = require('./schema/accounts');

const getAccountsIndex = () => getTableInstance('accounts', accountsIndexSchema);
const keyValueDB = require('../database/mysqlKVStore');

// Key constants for the KV-store
const genesisAccountPageCached = 'genesisAccountPageCached';
const isGenesisAccountIndexingFinished = 'isGenesisAccountIndexingFinished';

const performGenesisAccountsIndexing = async () => {
	const accountsDB = await getAccountsIndex();

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

module.exports = {
	indexGenesisAccounts,
};
