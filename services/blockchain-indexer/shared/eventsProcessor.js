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

const {
	getBlocks,
	performLastBlockUpdate,
	reloadNextForgersCache,
	reloadDelegateCache,
	getForgers,
	getNumberOfForgers,
	normalizeBlocks,
} = require('./dataService');

const { deleteBlock } = require('./indexer/blockchainIndex');

const config = require('../config');

const logger = Logger();

const eventsQueue = new MessageQueue(
	config.queue.events.name,
	config.endpoints.messageQueue,
	{ defaultJobOptions: config.queue.defaultJobOptions },
);

const newBlockProcessor = async (block) => {
	logger.debug(`New block arrived at height ${block.height}`);
	const [normalizedBlock] = await normalizeBlocks([block]);
	performLastBlockUpdate(normalizedBlock);
	const response = await getBlocks({ height: normalizedBlock.height });
	Signals.get('newBlock').dispatch(response);
};

const deleteBlockProcessor = async (block) => {
	logger.debug(`Performing updates on delete block event for the block at height: ${block.header.height}`);
	await deleteBlock(block);
	Signals.get('deleteBlock').dispatch({ data: [block] });
};

const newRoundProcessor = async () => {
	logger.debug('Performing updates on new round');
	await reloadDelegateCache();
	await reloadNextForgersCache();
	const limit = await getNumberOfForgers();
	const nextForgers = await getForgers({ limit, offset: 0 });
	const response = { nextForgers: nextForgers.data.map(forger => forger.address) };
	Signals.get('newRound').dispatch(response);
};

const initEventsProcess = async () => {
	eventsQueue.process(async (job) => {
		logger.debug('Subscribed to events');
		const { isNewBlock, isDeleteBlock, isNewRound } = job.data;

		if (isNewBlock) {
			const { block } = job.data;
			await newBlockProcessor(block);
		} else if (isDeleteBlock) {
			const { block } = job.data;
			await deleteBlockProcessor(block);
		} else if (isNewRound) await newRoundProcessor();
	});
};

module.exports = {
	initEventsProcess,
};
