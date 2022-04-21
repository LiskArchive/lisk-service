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

const {
	Logger,
} = require('lisk-service-framework');

const logger = Logger();

const { initEventsProcess } = require('./eventsProcessor');
const {
	buildLegacyAccountCache,
	addAccountToAddrUpdateQueue,
} = require('./indexer/accountIndex');

const {
	indexNewBlock,
	addBlockToQueue,
} = require('./indexer/blockchainIndex');

const config = require('../config');

const STATS_INTERVAL = 1 * 60 * 1000; // ms

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

let isLegacyAccountCached = false;

const queueStatus = async (queueInstance) => {
	setInterval(async () => {
		const jc = await queueInstance.getJobCounts();
		if (Number(jc.waiting) > 0 || Number(jc.active) > 0
			|| Number(jc.failed) > 0 || Number(jc.paused) > 0) {
			logger.info(`Queue counters for ${queueInstance.name}: waiting: ${jc.waiting}, active: ${jc.active}, failed: ${jc.failed}, paused: ${jc.paused}`);
		} else {
			logger.info(`Queue counters for ${queueInstance.name}: All scheduled jobs are done.`);
		}
	}, STATS_INTERVAL);
};

const initQueueStatus = async () => {
	await queueStatus(blockIndexQueue);
	await queueStatus(accountIndexQueue);
};

const initProcess = async () => {
	blockIndexQueue.process(async (job) => {
		logger.debug('Subscribed to block index message queue');
		const { height, isNewBlock } = job.data;

		if (isNewBlock) {
			logger.debug(`Scheduling indexing for new block at height: ${height}`);
			await indexNewBlock(height);
		} else {
			logger.debug(`Scheduling indexing for block at height: ${height}`);
			await addBlockToQueue(height);
		}
	});

	accountIndexQueue.process(async (job) => {
		logger.debug('Subscribed to account index message queue');
		if (!isLegacyAccountCached) {
			await buildLegacyAccountCache();
			isLegacyAccountCached = true;
			logger.info('Finished caching legacy accounts');
		}

		const { address } = job.data;
		logger.debug(`Scheduling indexing for account with address: ${address}`);
		await addAccountToAddrUpdateQueue(address);
	});

	await initQueueStatus();
};

const init = async () => {
	await initProcess();
	await initEventsProcess();
};

module.exports = {
	init,
};
