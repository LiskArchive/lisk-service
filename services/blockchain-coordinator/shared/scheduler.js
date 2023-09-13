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
	getGenesisHeight,
	getIndexVerifiedHeight,
	setIndexVerifiedHeight,
	isGenesisBlockIndexed,
	getLiveIndexingJobCount: getLiveIndexingJobCountFromIndexer,
} = require('./sources/indexer');

const {
	getRegisteredModules,
	getAllPosValidators,
} = require('./sources/connector');

const delay = require('./utils/delay');
const config = require('../config');

const blockMessageQueue = new MessageQueue(
	config.queue.block.name,
	config.endpoints.messageQueue,
	{ defaultJobOptions: config.queue.defaultJobOptions },
);

const accountMessageQueue = new MessageQueue(
	config.queue.account.name,
	config.endpoints.messageQueue,
	{ defaultJobOptions: config.queue.defaultJobOptions },
);

let registeredLiskModules;
let intervalID;
const REFRESH_INTERVAL = 30000;

const getInProgressJobCount = async (queue) => {
	const jobCount = await queue.getJobCounts();
	const count = jobCount.active + jobCount.waiting;
	return count;
};

const getLiveIndexingJobCount = async () => {
	const messageQueueJobCount = await getInProgressJobCount(blockMessageQueue);
	const indexerLiveIndexingJobCount = await getLiveIndexingJobCountFromIndexer();
	return messageQueueJobCount + indexerLiveIndexingJobCount;
};

const getRegisteredModuleAssets = () => registeredLiskModules;

const waitForJobCountToFallBelowThreshold = async () => {
	const { skipThreshold } = config.job.indexMissingBlocks;
	/* eslint-disable no-await-in-loop, no-constant-condition */
	while (true) {
		const count = await getLiveIndexingJobCount();
		if (count < skipThreshold) return;
		logger.info(`In progress job count (${String(count).padStart(5, ' ')}) not yet below the threshold (${skipThreshold}). Waiting for ${REFRESH_INTERVAL}ms to re-check the job count before scheduling the next batch.`);
		await delay(REFRESH_INTERVAL);
	}
	/* eslint-enable no-await-in-loop, no-constant-condition */
};

const waitForGenesisBlockIndexing = (resolve) => new Promise((res) => {
	if (!resolve) resolve = res;
	if (intervalID) {
		clearInterval(intervalID);
		intervalID = null;
	}

	return isGenesisBlockIndexed()
		.then(async (isIndexed) => {
			const jobCount = await getLiveIndexingJobCount();

			if (isIndexed) {
				logger.info('Genesis block is indexed.');
				return resolve(true);
			}

			if (jobCount <= 1) {
				logger.info(`Genesis block indexing is still in progress. Waiting for ${REFRESH_INTERVAL}ms to re-check the genesis block indexing status.`);
				intervalID = setInterval(
					waitForGenesisBlockIndexing.bind(null, resolve),
					REFRESH_INTERVAL,
				);
				return false;
			}

			throw new Error('Genesis block indexing failed.');
		});
});

const scheduleBlocksIndexing = async (heights) => {
	const blockHeights = Array.isArray(heights)
		? heights
		: [heights];

	blockHeights.sort((h1, h2) => h1 - h2); // sort heights in ascending order

	// Schedule indexing in batches when the list is too long to avoid OOM
	const MAX_BATCH_SIZE = 15000;
	const numBatches = Math.ceil(blockHeights.length / MAX_BATCH_SIZE);
	if (numBatches > 1) logger.info(`Scheduling the blocks indexing in ${numBatches} smaller batches of ${MAX_BATCH_SIZE}.`);

	const isMultiBatch = numBatches > 1;
	for (let i = 0; i < numBatches; i++) {
		/* eslint-disable no-await-in-loop */
		if (isMultiBatch) logger.debug(`Scheduling batch ${i + 1}/${numBatches}.`);
		const blockHeightsBatch = blockHeights.slice(i * MAX_BATCH_SIZE, (i + 1) * MAX_BATCH_SIZE);

		// eslint-disable-next-line no-restricted-syntax
		for (const height of blockHeightsBatch) {
			logger.trace(`Scheduling indexing for block at height: ${height}.`);
			await blockMessageQueue.add({ height });
			logger.debug(`Scheduled indexing for block at height: ${height}.`);
		}

		if (isMultiBatch) logger.info(`Finished scheduling batch ${i + 1}/${numBatches} (Heights: ${blockHeightsBatch.at(0)} - ${blockHeightsBatch.at(-1)}, ${blockHeightsBatch.length} blocks).`);
		await waitForJobCountToFallBelowThreshold();
		/* eslint-enable no-await-in-loop */
	}
};

const scheduleValidatorsIndexing = async (validators) => {
	await BluebirdPromise.map(
		validators,
		async validator => accountMessageQueue.add({
			account: {
				...validator,
				isValidator: true,
			},
		}),
		{ concurrency: validators.length },
	);

	logger.info('Finished scheduling of validators indexing.');
};

const indexGenesisBlock = async () => {
	if (await isGenesisBlockIndexed()) {
		logger.info('Genesis block is already indexed.');
		return;
	}

	const genesisHeight = await getGenesisHeight();
	logger.debug('Scheduling genesis block indexing.');
	await scheduleBlocksIndexing(genesisHeight);
	logger.info('Finished scheduling genesis block indexing.');

	await waitForGenesisBlockIndexing()
		.catch(async () => {
			logger.warn('Genesis indexing failed. Retrying.');
			await indexGenesisBlock();
		});
};

const initIndexingScheduler = async () => {
	// Retrieve enabled modules from connector
	registeredLiskModules = await getRegisteredModules();

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

	// Missing blocks are being checked during regular interval
	// By default they are checked from the blockchain's beginning
	const lastVerifiedHeight = await getIndexVerifiedHeight() || genesisHeight;

	// Lowest and highest block heights expected to be indexed
	const blockIndexHigherRange = currentHeight;
	const blockIndexLowerRange = lastVerifiedHeight;

	try {
		const missingBlocksByHeight = [];
		const MAX_QUERY_RANGE = 25000;
		const NUM_BATCHES = Math.ceil((blockIndexHigherRange - blockIndexLowerRange) / MAX_QUERY_RANGE);

		// Batch into smaller ranges to avoid microservice/DB query timeouts
		for (let i = 0; i < NUM_BATCHES; i++) {
			/* eslint-disable no-await-in-loop */
			const batchStartHeight = blockIndexLowerRange + i * MAX_QUERY_RANGE;
			const batchEndHeight = Math.min(batchStartHeight + MAX_QUERY_RANGE, blockIndexHigherRange);
			const result = await getMissingBlocks(batchStartHeight, batchEndHeight);

			if (Array.isArray(result)) {
				missingBlocksByHeight.push(...result);

				if (result.length === 0) {
					const lastIndexVerifiedHeight = await getIndexVerifiedHeight();
					if (batchEndHeight === (lastIndexVerifiedHeight + MAX_QUERY_RANGE)) {
						await setIndexVerifiedHeight(batchEndHeight);
						logger.debug(`No missing blocks found in range ${batchStartHeight} - ${batchEndHeight}. Setting index verified height to ${batchEndHeight}.`);
					}
				}
			}
			/* eslint-enable no-await-in-loop */
		}

		if (missingBlocksByHeight.length === 0) {
			// Update 'indexVerifiedHeight' when no missing blocks are found
			await setIndexVerifiedHeight(blockIndexHigherRange);
			logger.info(`No missing blocks found in range ${blockIndexLowerRange} - ${blockIndexHigherRange}. Setting index verified height to ${blockIndexHigherRange}.`);
		} else {
			// Schedule indexing for the missing blocks
			await scheduleBlocksIndexing(missingBlocksByHeight);
			logger.info('Successfully scheduled missing blocks indexing.');
		}
	} catch (err) {
		logger.warn(`Missing blocks indexing scheduling failed due to: ${err.message}.`);
		logger.trace(err.stack);
	}
};

const init = async () => {
	await indexGenesisBlock();
	await initIndexingScheduler();
	await initEventsScheduler();
};

module.exports = {
	init,
	getRegisteredModuleAssets,
	scheduleMissingBlocksIndexing,
};
