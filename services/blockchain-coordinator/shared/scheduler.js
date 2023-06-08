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
	getMissingBlocks,
	getCurrentHeight,
	getIndexVerifiedHeight,
	setIndexVerifiedHeight,
} = require('./sources/indexer');

const {
	getAllPosValidators,
	getGenesisHeight,
} = require('./sources/connector');

const config = require('../config');

const blockIndexQueue = new MessageQueue(
	config.queue.blocks.name,
	config.endpoints.messageQueue,
	{ defaultJobOptions: config.queue.defaultJobOptions },
);

const accountIndexQueue = new MessageQueue(
	config.queue.accounts.name,
	config.endpoints.messageQueue,
	{ defaultJobOptions: config.queue.defaultJobOptions },
);

const { threshold } = config.job.indexMissingBlocks;

const getJobCount = async (queue) => (await queue.getActiveCount() + await queue.getWaitingCount());

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

const scheduleValidatorsIndexing = async (validators) => {
	await BluebirdPromise.map(
		validators,
		async validator => accountIndexQueue.add({
			account: {
				...validator,
				isValidator: true,
			},
		}),
		{ concurrency: validators.length },
	);

	logger.info(`Finished scheduling of validators indexing with ${validators.length} validators.`);
};

const indexGenesisBlock = async () => {
	const genesisHeight = await getGenesisHeight();
	logger.debug('Scheduling genesis block indexing.');
	await scheduleBlocksIndexing(genesisHeight);
	logger.info('Finished scheduling genesis block indexing.');
};

const initIndexingScheduler = async () => {
	// Get all validators and schedule indexing
	const { validators } = await getAllPosValidators();
	if (Array.isArray(validators) && validators.length) {
		await scheduleValidatorsIndexing(validators);
	}

	// Check for missing blocks
	const genesisHeight = await getGenesisHeight();
	const currentHeight = await getCurrentHeight();
	const missingBlocksByHeight = await getMissingBlocks(genesisHeight + 1, currentHeight);

	// Schedule indexing for the missing blocks
	if (Array.isArray(missingBlocksByHeight) && missingBlocksByHeight.length) {
		await scheduleBlocksIndexing(missingBlocksByHeight);
	}
};

const scheduleMissingBlocksIndexing = async () => {
	const genesisHeight = await getGenesisHeight();
	const currentHeight = await getCurrentHeight();

	const jobCount = await getJobCount(blockIndexQueue);

	// Skip missing blocks scheduling if Active+Waiting job count >= threshold or
	// Active+Waiting job count <= (currentHeight - genesisHeight + 1 - configurableThreshold)
	if (jobCount >= threshold || jobCount <= (currentHeight - genesisHeight + 1 - threshold)) {
		logger.info('Skip scheduling missing blocks job.');
		return;
	}

	// Missing blocks are being checked during regular interval
	// By default they are checked from the blockchain's beginning
	const lastVerifiedHeight = await getIndexVerifiedHeight() || genesisHeight;

	// Lowest and highest block heights expected to be indexed
	const blockIndexHigherRange = currentHeight;
	const blockIndexLowerRange = lastVerifiedHeight;

	const missingBlocksByHeight = await getMissingBlocks(
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
		logger.warn(`Missing blocks indexing failed due to: ${err.message}.`);
	}
};

const init = async () => {
	try {
		await indexGenesisBlock();
		await initIndexingScheduler();
		await initEventsScheduler();
	} catch (error) {
		logger.error(`Unable to initialize coordinator due to: ${error.message}`);
	}
};

module.exports = {
	init,
	scheduleMissingBlocksIndexing,
};
