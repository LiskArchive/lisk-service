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

const { Logger } = require('lisk-service-framework');

const logger = Logger();

const { initEventsScheduler } = require('./eventsScheduler');
const {
	getIndexStatus,
	getMissingBlocks,
	getIndexVerifiedHeight,
	isGenesisBlockIndexed,
	getLiveIndexingJobCount: getLiveIndexingJobCountFromIndexer,
} = require('./sources/indexer');

const { getAllPosValidators } = require('./sources/connector');

const { getCurrentHeight, getGenesisHeight, initNodeConstants } = require('./constants');

const { range } = require('./utils/array');
const delay = require('./utils/delay');
const config = require('../config');

const blockMessageQueue = new MessageQueue(config.queue.block.name, config.endpoints.messageQueue, {
	defaultJobOptions: config.queue.defaultJobOptions,
});

const accountMessageQueue = new MessageQueue(
	config.queue.account.name,
	config.endpoints.messageQueue,
	{ defaultJobOptions: config.queue.defaultJobOptions },
);

let intervalID;
const REFRESH_INTERVAL = config.job.progressRefreshInterval;

const getInProgressJobCount = async queue => {
	const jobCount = await queue.getJobCounts();
	const count = jobCount.active + jobCount.waiting;
	return count;
};

const getLiveIndexingJobCount = async () => {
	const messageQueueJobCount = await getInProgressJobCount(blockMessageQueue);
	const indexerLiveIndexingJobCount = await getLiveIndexingJobCountFromIndexer();
	return messageQueueJobCount + indexerLiveIndexingJobCount;
};

const waitForJobCountToFallBelowThreshold = async () => {
	const { skipThreshold } = config.job.indexMissingBlocks;
	/* eslint-disable no-constant-condition */
	while (true) {
		const count = await getLiveIndexingJobCount();
		if (count < skipThreshold) return;
		logger.info(
			`In progress job count (${String(count).padStart(
				5,
				' ',
			)}) not yet below the threshold (${skipThreshold}). Waiting for ${REFRESH_INTERVAL}ms to re-check the job count before scheduling the next batch.`,
		);
		await delay(REFRESH_INTERVAL);
	}
	/* eslint-enable no-constant-condition */
};

const waitForGenesisBlockIndexing = (resolve, reject) =>
	new Promise((res, rej) => {
		if (!resolve) resolve = res;
		if (!reject) reject = rej;

		if (intervalID) {
			clearInterval(intervalID);
			intervalID = null;
		}

		return isGenesisBlockIndexed().then(async isIndexed => {
			if (isIndexed) {
				logger.info('Genesis block is indexed.');
				return resolve(true);
			}

			const jobCount = await getLiveIndexingJobCount();
			if (jobCount >= 1) {
				logger.info(
					`Genesis block indexing is still in progress. Waiting for ${REFRESH_INTERVAL}ms to re-check the genesis block indexing status.`,
				);
				intervalID = setInterval(
					waitForGenesisBlockIndexing.bind(null, resolve, reject),
					REFRESH_INTERVAL,
				);
				return false;
			}

			return reject(new Error('Genesis block indexing failed.'));
		});
	});

const scheduleBlocksIndexing = async heights => {
	const blockHeights = Array.isArray(heights) ? heights : [heights];

	blockHeights.sort((h1, h2) => h1 - h2); // sort heights in ascending order

	// Schedule indexing in batches when the list is too long to avoid OOM
	const MAX_BATCH_SIZE = 15000;
	const numBatches = Math.ceil(blockHeights.length / MAX_BATCH_SIZE);
	if (numBatches > 1)
		logger.info(
			`Scheduling the blocks indexing in ${numBatches} smaller batches of ${MAX_BATCH_SIZE}.`,
		);

	const isMultiBatch = numBatches > 1;
	for (let i = 0; i < numBatches; i++) {
		await waitForJobCountToFallBelowThreshold();

		if (isMultiBatch) logger.debug(`Scheduling batch ${i + 1}/${numBatches}.`);
		const blockHeightsBatch = blockHeights.slice(i * MAX_BATCH_SIZE, (i + 1) * MAX_BATCH_SIZE);

		// eslint-disable-next-line no-restricted-syntax
		for (const height of blockHeightsBatch) {
			logger.trace(`Scheduling indexing for block at height: ${height}.`);
			await blockMessageQueue.add({ height });
			logger.debug(`Scheduled indexing for block at height: ${height}.`);
		}

		if (isMultiBatch)
			logger.info(
				`Finished scheduling batch ${i + 1}/${numBatches} (Heights: ${blockHeightsBatch.at(
					0,
				)} - ${blockHeightsBatch.at(-1)}, ${blockHeightsBatch.length} blocks).`,
			);
	}
};

const scheduleValidatorsIndexing = async validators => {
	await BluebirdPromise.map(
		validators,
		async validator =>
			accountMessageQueue.add({
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
	if (await isGenesisBlockIndexed()) {
		logger.info('Genesis block is already indexed.');
		return;
	}

	const genesisHeight = await getGenesisHeight();
	logger.debug('Scheduling genesis block indexing.');
	await scheduleBlocksIndexing(genesisHeight);
	logger.info('Finished scheduling genesis block indexing.');

	await waitForGenesisBlockIndexing().catch(async () => {
		logger.warn('Genesis indexing failed. Retrying.');
		await indexGenesisBlock();
	});
};

const initIndexingScheduler = async () => {
	// Get all validators and schedule indexing
	logger.debug('Initializing validator indexing scheduler.');
	const { validators } = await getAllPosValidators();
	if (Array.isArray(validators) && validators.length) {
		await scheduleValidatorsIndexing(validators);
	}
	logger.info('Validator indexing initialization completed successfully.');

	// Skip scheduling jobs for missing blocks when the jobCount is greater than the threshold
	const jobCount = await getLiveIndexingJobCount();
	if (jobCount > config.job.indexMissingBlocks.skipThreshold) {
		logger.info(
			`Skipping the check for missing blocks. ${jobCount} blocks already queued for indexing.`,
		);
	} else {
		// Check for missing blocks
		logger.debug('Initializing block indexing scheduler.');
		const genesisHeight = await getGenesisHeight();
		const currentHeight = await getCurrentHeight();
		const lastVerifiedHeight = (await getIndexVerifiedHeight()) || genesisHeight + 1;

		logger.debug(
			`Checking for missing blocks between heights: ${lastVerifiedHeight} - ${currentHeight}.`,
		);
		const missingBlockHeights = await getMissingBlocks(lastVerifiedHeight, currentHeight);

		// Schedule indexing for the missing blocks
		if (Array.isArray(missingBlockHeights) && missingBlockHeights.length) {
			logger.info(
				`${missingBlockHeights.length} missing blocks found between heights: ${lastVerifiedHeight} - ${currentHeight}. Attempting to schedule indexing.`,
			);
			await scheduleBlocksIndexing(missingBlockHeights);
			logger.info(
				`Finished scheduling indexing of ${missingBlockHeights.length} missing blocks between heights: ${lastVerifiedHeight} - ${currentHeight}.`,
			);
		} else {
			logger.info(
				`No missing blocks found between heights: ${lastVerifiedHeight} - ${currentHeight}. Nothing to schedule.`,
			);
		}
	}
	logger.info('Block indexing initialization completed successfully.');
};

const scheduleMissingBlocksIndexing = async () => {
	if (!(await isGenesisBlockIndexed())) {
		logger.info('Genesis block is not yet indexed, skipping missing blocks job run.');
		return;
	}

	// Skip job scheduling when the jobCount is greater than the threshold
	const jobCount = await getLiveIndexingJobCount();
	if (jobCount > config.job.indexMissingBlocks.skipThreshold) {
		logger.info(
			`Skipping missing blocks job run. ${jobCount} indexing jobs already in the queue. Current threshold: ${config.job.indexMissingBlocks.skipThreshold}.`,
		);
		return;
	}

	const genesisHeight = await getGenesisHeight();
	const currentHeight = await getCurrentHeight();

	// Missing blocks are being checked during regular interval
	// By default they are checked from the blockchain's beginning
	const lastVerifiedHeight = (await getIndexVerifiedHeight()) || genesisHeight;

	// Lowest and highest block heights expected to be indexed
	const blockIndexLowerRange = lastVerifiedHeight;
	const blockIndexHigherRange = Math.min(
		blockIndexLowerRange + config.job.indexMissingBlocks.maxBlocksToSchedule,
		currentHeight,
	);

	try {
		const missingBlocksByHeight = [];
		const MAX_QUERY_RANGE = 10000;
		const NUM_BATCHES = Math.ceil((blockIndexHigherRange - blockIndexLowerRange) / MAX_QUERY_RANGE);

		// Batch into smaller ranges to avoid microservice/DB query timeouts
		for (let i = 0; i < NUM_BATCHES; i++) {
			const batchStartHeight = blockIndexLowerRange + i * MAX_QUERY_RANGE;
			const batchEndHeight = Math.min(batchStartHeight + MAX_QUERY_RANGE, blockIndexHigherRange);
			const result = await getMissingBlocks(batchStartHeight, batchEndHeight);

			if (Array.isArray(result)) {
				missingBlocksByHeight.push(...result);
			} else {
				logger.warn(
					`getMissingBlocks returned '${typeof result}' type instead of an Array.\nresult: ${JSON.stringify(
						result,
						null,
						'\t',
					)}`,
				);
			}
		}

		// Re-check for tiny gaps and schedule jobs accordingly
		const indexStatus = await getIndexStatus();
		if (indexStatus) {
			const { chainLength, numBlocksIndexed, lastBlockHeight } = indexStatus.data;
			const numStillMissingJobs = chainLength - numBlocksIndexed - missingBlocksByHeight.length;

			if (numStillMissingJobs > 0 && numStillMissingJobs <= 100) {
				missingBlocksByHeight.push(
					...range(lastBlockHeight - numStillMissingJobs + 1, lastBlockHeight + 1),
				);
			}
		}

		if (missingBlocksByHeight.length) {
			// Schedule indexing for the missing blocks
			await scheduleBlocksIndexing(missingBlocksByHeight);
			logger.info('Successfully scheduled missing blocks indexing.');
		} else {
			logger.info(
				`No missing blocks found in range ${blockIndexLowerRange} - ${blockIndexHigherRange}.`,
			);
		}
	} catch (err) {
		logger.warn(`Scheduling to index missing blocks failed due to: ${err.message}`);
		logger.trace(err.stack);
	}
};

const init = async () => {
	try {
		await initNodeConstants();
		await indexGenesisBlock();
		await initIndexingScheduler();
		await initEventsScheduler();
	} catch (err) {
		logger.error(`Unable to initialize coordinator due to: ${err.message}`);
		logger.trace(err.stack);
		throw err;
	}
};

module.exports = {
	init,
	scheduleMissingBlocksIndexing,
};
