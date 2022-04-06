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
const Queue = require('bull');

const {
	Logger,
} = require('lisk-service-framework');

const logger = Logger();

const {
	isGenesisBlockAlreadyIndexed,
	isGenesisAccountAlreadyIndexed,
	getDelegatesAccounts,
	getGenesisAccounts,
	getMissingblocks,
	getCurrentHeight,
	getGenesisHeight,
} = require('./sources/indexer');

const {
	getEnabledModules,
} = require('./sources/connector');

const config = require('../config');
const Signals = require('./signals');

const blockIndexQueue = new Queue('Blocks', config.endpoints.redis);
const accountIndexQueue = new Queue('Accounts', config.endpoints.redis);

let registeredLiskModules;
const setRegisteredmodules = modules => registeredLiskModules = modules;
const getRegisteredModuleAssets = () => registeredLiskModules;

const scheduleGenesisBlockIndexing = async () => {
	const genesisHeight = await getGenesisHeight();
	await blockIndexQueue.add({ height: genesisHeight });
	logger.info('Finished scheduling of genesis block indexing');
};

const scheduleBlocksIndexing = async (blocksHeightToIndex) => {
	await Promise.all(blocksHeightToIndex
		.map(async height => blockIndexQueue
			.add({ height }),
		),
	);
	logger.info('Finished scheduling of missing blocks indexing');
};

const scheduleNewBlockIndexing = async (block) => {
	await blockIndexQueue
		.add({ height: block.height, isNewBlock: true });
	logger.info(`Finished scheduling of new block indexing at height ${block.height}`);
};

const scheduleDelegateAccountsIndexing = async (addresses) => {
	await Promise.all(addresses
		.map(async (address) => accountIndexQueue
			.add({ address }),
		),
	);
	logger.info('Finished scheduling of delegate accounts indexing');
};

const scheduleGenesisAccountsIndexing = async (accountAddressesToIndex) => {
	await Promise.all(accountAddressesToIndex
		.map(async (address) => accountIndexQueue
			.add({ address }),
		),
	);
	logger.info('Finished scheduling of genesis accounts indexing');
};

const init = async () => {
	// Schedule indexing new block
	Signals.get('newBlock').add(block => scheduleNewBlockIndexing(block.header));

	// Retrieve enabled modules from connector
	setRegisteredmodules(await getEnabledModules());

	// Get all delegates and schedule indexing
	const delegates = await getDelegatesAccounts();
	if (delegates && delegates.length) {
		await scheduleDelegateAccountsIndexing(delegates);
	}

	// Check if genesis block is already indexed and schedule indexing if it is not indexed
	const isGenesisBlockIndexed = await isGenesisBlockAlreadyIndexed();
	if (!isGenesisBlockIndexed) {
		scheduleGenesisBlockIndexing();
	}

	// Check for missing blocks and schedule indexing
	const currentHeight = await getCurrentHeight();
	const genesisHeight = await getGenesisHeight();
	const listOfMssingBlocksHeight = await getMissingblocks(genesisHeight, currentHeight);

	// Schedule block indexing
	if (listOfMssingBlocksHeight && listOfMssingBlocksHeight.length) {
		await scheduleBlocksIndexing(listOfMssingBlocksHeight);
	}

	// Schedule genesis accounts indexing
	const isGenesisAccountIndexed = await isGenesisAccountAlreadyIndexed();
	if (!isGenesisAccountIndexed) {
		const genesisAccountAddresses = await getGenesisAccounts();
		if (genesisAccountAddresses && genesisAccountAddresses.length) {
			await scheduleGenesisAccountsIndexing(genesisAccountAddresses);
		}
	}
};

module.exports = {
	init,
	getRegisteredModuleAssets,
};
