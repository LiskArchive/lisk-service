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
const MessageQueue = require('bull');
const BluebirdPromise = require('bluebird');

const {
	Logger,
} = require('lisk-service-framework');

const logger = Logger();

const { initEventsScheduler } = require('./eventsScheduler');
const {
	isGenesisBlockIndexed,
	// isGenesisAccountsIndexed,
	// getDelegateAccounts,
	// getGenesisAccountAddresses,
	getMissingblocks,
	getCurrentHeight,
	getGenesisHeight,
	getIndexVerifiedHeight,
	setIndexVerifiedHeight,
} = require('./sources/indexer');

const {
	getRegisteredModules,
} = require('./sources/connector');

const config = require('../config');

const blockIndexQueue = new MessageQueue(
	config.queue.blocks.name,
	config.endpoints.messageQueue,
	{ defaultJobOptions: config.queue.defaultJobOptions },
);

// const accountIndexQueue = new MessageQueue(
// 	config.queue.accounts.name,
// 	config.endpoints.messageQueue,
// 	{ defaultJobOptions: config.queue.defaultJobOptions },
// );

let registeredLiskModules;
const getRegisteredModuleAssets = () => registeredLiskModules;

const scheduleGenesisBlockIndexing = async () => {
	const genesisHeight = await getGenesisHeight();
	await blockIndexQueue.add({ height: genesisHeight });
	logger.info('Finished scheduling of genesis block indexing.');
};

const scheduleBlocksIndexing = async (heights) => {
	const blockHeights = Array.isArray(heights)
		? heights
		: [heights];

	await BluebirdPromise.map(
		blockHeights,
		async height => {
			await blockIndexQueue.add({ height });
			logger.debug(`Scheduled indexing for block at height: ${height}.`);
		},
		{ concurrency: blockHeights.length },
	);
};

// const scheduleDelegateAccountsIndexing = async (addresses) => {
// 	await Promise.all(addresses
// 		.map(async (address) => accountIndexQueue.add({ address })),
// 	);
// 	logger.info('Finished scheduling of validator accounts indexing.');
// };

// const scheduleGenesisAccountsIndexing = async (accountAddressesToIndex) => {
// 	await Promise.all(accountAddressesToIndex
// 		.map(async (address) => accountIndexQueue.add({ address })),
// 	);
// 	logger.info('Finished scheduling of genesis accounts indexing.');
// };

const initIndexingScheduler = async () => {
	// Retrieve enabled modules from connector
	registeredLiskModules = await getRegisteredModules();

	// Get all validators and schedule indexing
	// const validators = await getDelegateAccounts();
	// if (Array.isArray(validators) && validators.length) {
	// 	await scheduleDelegateAccountsIndexing(validators);
	// }

	// Check if genesis block is already indexed and schedule indexing if not indexed
	const isGenesisBlockAlreadyIndexed = await isGenesisBlockIndexed();
	if (!isGenesisBlockAlreadyIndexed) {
		await scheduleGenesisBlockIndexing();
	}

	// Check for missing blocks
	const genesisHeight = await getGenesisHeight();
	const currentHeight = await getCurrentHeight();
	const missingBlocksByHeight = await getMissingblocks(genesisHeight, currentHeight);

	// Schedule indexing for the missing blocks
	if (Array.isArray(missingBlocksByHeight) && missingBlocksByHeight.length) {
		await scheduleBlocksIndexing(missingBlocksByHeight);
	}

	// Schedule genesis accounts indexing
	// const isGenesisAccountsAlreadyIndexed = await isGenesisAccountsIndexed();
	// if (!isGenesisAccountsAlreadyIndexed) {
	// 	const genesisAccountAddresses = await getGenesisAccountAddresses();
	// 	if (Array.isArray(genesisAccountAddresses) && genesisAccountAddresses.length) {
	// 		await scheduleGenesisAccountsIndexing(genesisAccountAddresses);
	// 	}
	// }
};

const scheduleMissingBlocksIndexing = async () => {
	const genesisHeight = await getGenesisHeight();
	const currentHeight = await getCurrentHeight();

	// Missing blocks are being checked during regualar interval
	// By default they are checked from the blockchain's beginning
	const lastVerifiedHeight = await getIndexVerifiedHeight() || genesisHeight;

	// Lowest and highest block heights expected to be indexed
	const blockIndexHigherRange = currentHeight;
	const blockIndexLowerRange = lastVerifiedHeight;

	const missingBlocksByHeight = await getMissingblocks(
		blockIndexLowerRange,
		blockIndexHigherRange,
	);

	try {
		if (!Array.isArray(missingBlocksByHeight)) {
			logger.trace(`missingBlocksByHeight: ${missingBlocksByHeight}`);
			throw new Error(`Expected missingBlocksByHeight to be an array but found ${typeof missingBlocksByHeight}.`);
		}

		if (missingBlocksByHeight.length === 0) {
			// Update 'indexVerifiedHeight' when no missing blocks are found
			await setIndexVerifiedHeight(blockIndexHigherRange);
		} else {
			// Schedule indexing for the missing blocks
			await scheduleBlocksIndexing(missingBlocksByHeight);
		}
	} catch (err) {
		logger.warn(`Missed blocks indexing failed due to: ${err.message}.`);
	}
};

const init = async () => {
	await initIndexingScheduler();
	await initEventsScheduler();
};

module.exports = {
	init,
	getRegisteredModuleAssets,
	scheduleMissingBlocksIndexing,
};
