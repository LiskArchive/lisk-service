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
const { Logger } = require('lisk-service-framework');
const Signals = require('./utils/signals');

const {
	performLastBlockUpdate,
	getBlocks,
	deleteBlock,
	getTotalNumberOfBlocks,
} = require('./dataService/blocks');

const {
	reloadNextForgersCache,
	reloadDelegateCache,
	getForgers,
} = require('./dataService/delegates');

const {
	getNumberOfForgers,
	normalizeBlocks,
} = require('./dataService/business');

const config = require('../config');

const logger = Logger();

const eventsQueue = new MessageQueue(
	config.queue.events.name,
	config.endpoints.messageQueue,
	{ defaultJobOptions: config.queue.defaultJobOptions },
);

const initEventsProcess = async () => {
	eventsQueue.process(async (job) => {
		logger.debug('Subscribed to events');
		const { isNewBlock, isDeleteBlock, isNewRound } = job.data;

		if (isNewBlock) {
			const { block: newBlock, addresses } = job.data;
			logger.debug(`Performing updates on new block at height: ${newBlock.header.height}`);
			const [block] = await normalizeBlocks([newBlock]);
			logger.debug(`New block arrived: ${block.id} at height ${block.height}`);
			performLastBlockUpdate(block);
			let response;
			try {
				response = await getBlocks({ height: block.height });
			} catch (_) {
				response = {
					data: [block],
					meta: { count: 1, offset: 0, total: await getTotalNumberOfBlocks() },
				};
			}

			logger.debug(`============== 'newBlock' signal: ${Signals.get('newBlock')} ==============`);
			Signals.get('newBlock').dispatch(response);
			Signals.get('updateAccountsByAddress').dispatch(addresses);
		}

		if (isDeleteBlock) {
			const { block, addresses } = job.data;
			await deleteBlock(block);
			logger.debug(`Performing updates on delete block at height: ${block.header.height}`);
			Signals.get('deleteBlock').dispatch({ data: [block] });
			Signals.get('updateAccountsByAddress').dispatch(addresses);
		}

		if (isNewRound) {
			logger.debug('Performing updates on new round');
			await reloadDelegateCache();
			await reloadNextForgersCache();
			const limit = await getNumberOfForgers();
			const nextForgers = await getForgers({ limit, offset: 0 });
			const response = { nextForgers: nextForgers.data.map(forger => forger.address) };
			logger.debug(`============== 'newRound' signal: ${Signals.get('newRound')} ==============`);
			Signals.get('newRound').dispatch(response);
		}
	});
};

module.exports = {
	initEventsProcess,
};
