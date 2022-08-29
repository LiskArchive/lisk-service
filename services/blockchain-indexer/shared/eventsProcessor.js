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
	reloadGeneratorsCache,
	reloadDelegateCache,
	getGenerators,
	getNumberOfGenerators,
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
	logger.debug(`New block arrived at height ${block.height}, id: ${block.id}`);
	const response = await getBlocks({ height: block.height });
	await performLastBlockUpdate(response.data[0]);
	Signals.get('newBlock').dispatch(response);
};

// TODO: Test delete block implementation with the issue https://github.com/LiskHQ/lisk-service/issues/1189
const deleteBlockProcessor = async (block) => {
	let response;
	try {
		logger.debug(`Processing the delete block event for the block at height: ${block.height}, id: ${block.id}`);
		response = await getBlocks({ blockID: block.id });
		await deleteBlock(block);
	} catch (error) {
		const normalizedBlocks = await normalizeBlocks([{
			header: block,
			transactions: [],
			assets: [],
		}]);
		response = { data: normalizedBlocks };
	}
	Signals.get('deleteBlock').dispatch(response);
};

const newRoundProcessor = async () => {
	logger.debug('Performing updates on new round');
	await reloadDelegateCache();
	await reloadGeneratorsCache();
	const limit = await getNumberOfGenerators();
	const generators = await getGenerators({ limit, offset: 0 });
	const response = { generators: generators.data.map(generator => generator.address) };
	Signals.get('newRound').dispatch(response);
};

const initEventsProcess = async () => {
	eventsQueue.process(async (job) => {
		logger.debug('Subscribed to the events from coordinator');
		const { isNewBlock, isDeleteBlock, isNewRound } = job.data;

		if (isNewBlock) {
			const { blockHeader } = job.data;
			await newBlockProcessor(blockHeader);
		} else if (isDeleteBlock) {
			const { blockHeader } = job.data;
			await deleteBlockProcessor(blockHeader);
		} else if (isNewRound) await newRoundProcessor();
	});
};

module.exports = {
	initEventsProcess,
};
