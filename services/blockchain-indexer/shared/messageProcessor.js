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

const { Logger, Signals } = require('lisk-service-framework');

const config = require('../config');

const logger = Logger();

const { initNodeConstants } = require('./constants');

const {
	addHeightToIndexBlocksQueue,
	scheduleBlockDeletion,
	indexNewBlock,
} = require('./indexer/blockchainIndex');

const {
	formatBlock,
	performLastBlockUpdate,
	reloadGeneratorsCache,
	reloadValidatorCache,
	getGenerators,
	getNumberOfGenerators,
} = require('./dataService');
const { accountAddrUpdateQueue } = require('./indexer/accountIndex');

const STATS_INTERVAL = 1 * 60 * 1000; // ms

const accountMessageQueue = new MessageQueue(
	config.queue.account.name,
	config.endpoints.messageQueue,
	{ defaultJobOptions: config.queue.defaultJobOptions },
);

// Missing blocks
const blockMessageQueue = new MessageQueue(config.queue.block.name, config.endpoints.messageQueue, {
	defaultJobOptions: config.queue.defaultJobOptions,
});

// Newly generated blocks
const eventMessageQueue = new MessageQueue(config.queue.event.name, config.endpoints.messageQueue, {
	defaultJobOptions: config.queue.defaultJobOptions,
});

const queueStatus = async messageQueue => {
	setInterval(async () => {
		const jc = await messageQueue.getJobCounts();
		const logSuffix =
			jc.waiting || jc.active || jc.failed || jc.paused
				? `waiting: ${jc.waiting}, active: ${jc.active}, failed: ${jc.failed}, paused: ${jc.paused}`
				: 'All scheduled jobs are done';

		logger.info(`Message queue counters for ${messageQueue.name}: ${logSuffix}.`);
	}, STATS_INTERVAL);
};

const initQueueStatus = async () => {
	await queueStatus(accountMessageQueue);
	await queueStatus(blockMessageQueue);
	await queueStatus(eventMessageQueue);
};

const newBlockProcessor = async block => {
	logger.debug(`New block (${block.header.id}) received at height ${block.header.height}.`);
	const response = await formatBlock(block);
	const [newBlock] = response.data;

	await indexNewBlock(newBlock);
	await performLastBlockUpdate(newBlock);
	Signals.get('newBlock').dispatch(response);
	logger.info(
		`Finished scheduling new block (${block.header.id}) event for block height ${block.header.height}.`,
	);
};

const deleteBlockProcessor = async header => {
	try {
		logger.debug(
			`Scheduling the delete block (${header.id}) event for block height ${header.height}.`,
		);
		const response = await formatBlock({ header }, true);
		await scheduleBlockDeletion(header);
		Signals.get('deleteBlock').dispatch(response);
		logger.info(
			`Finished scheduling the delete block (${header.id}) event for block height ${header.height}.`,
		);
	} catch (err) {
		logger.warn(
			`Processing delete block event for ID ${header.id} at height ${header.height} failed due to: ${err.message}. Will retry.`,
		);
		throw err;
	}
};

const newRoundProcessor = async () => {
	logger.debug('Performing updates on new round.');
	await reloadValidatorCache();
	await reloadGeneratorsCache();
	const limit = await getNumberOfGenerators();
	const generators = await getGenerators({ limit, offset: 0 });
	Signals.get('newRound').dispatch(generators);
	logger.info(`Finished performing all updates on new round.`);
};

const initMessageProcessors = async () => {
	logger.info(`Registering job processor for ${accountMessageQueue.name} message queue.`);
	accountMessageQueue.process(async job => {
		const { account } = job.data;
		logger.debug(`Scheduling indexing for account with address: ${account.address}.`);
		await accountAddrUpdateQueue.add(account);
	});

	logger.info(`Registering job processor for ${blockMessageQueue.name} message queue.`);
	blockMessageQueue.process(async job => {
		logger.debug('Subscribed to block index message queue.');
		const { height } = job.data;

		logger.debug(`Scheduling indexing for block at height: ${height}.`);
		await addHeightToIndexBlocksQueue(height);
	});

	logger.info(`Registering job processor for ${eventMessageQueue.name} message queue.`);

	eventMessageQueue.process(async job => {
		logger.debug('Subscribed to the events from coordinator.');
		const { isNewBlock, isDeleteBlock, isNewRound } = job.data;

		if (isNewBlock) {
			const { block } = job.data;
			await newBlockProcessor(block);
		} else if (isDeleteBlock) {
			try {
				const { header } = job.data;
				await deleteBlockProcessor(header);
			} catch (err) {
				if (job.attemptsMade === job.opts.attempts - 1) {
					await eventMessageQueue.add(job.data);
				}
			}
		} else if (isNewRound) {
			await newRoundProcessor();
		}
	});

	await initQueueStatus();
};

const init = async () => {
	await initNodeConstants();
	await initMessageProcessors();
};

module.exports = {
	init,
};
