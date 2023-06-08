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
const {
	Logger,
	Signals,
} = require('lisk-service-framework');

const MessageQueue = require('bull');
const config = require('../config');

const logger = Logger();

const eventsQueue = new MessageQueue(
	config.queue.events.name,
	config.endpoints.messageQueue,
	{ defaultJobOptions: config.queue.defaultJobOptions },
);

const scheduleUpdatesOnNewBlock = async (payload) => {
	const { blockHeader } = payload;
	logger.debug(`Scheduling indexing new block at height: ${blockHeader.height}.`);
	await eventsQueue.add({ blockHeader, isNewBlock: true });
	logger.info(`Finished scheduling indexing new block at height: ${blockHeader.height}.`);
};

const scheduleDeleteBlock = async (payload) => {
	const { blockHeader } = payload;
	logger.debug(`Scheduling updates for the delete block at height: ${blockHeader.height}.`);
	await eventsQueue.add({ blockHeader, isDeleteBlock: true });
	logger.info(`Finished scheduling updates for the delete block at height: ${blockHeader.height}.`);
};

const scheduleUpdatesOnNewRound = async (payload) => {
	const { validators } = payload;
	logger.debug('Scheduling updates on new round.');
	await eventsQueue.add({ validators, isNewRound: true });
	logger.debug('Finished scheduling updates on new round}.');
};

const initEventsScheduler = async () => {
	const newBlockListener = async (payload) => scheduleUpdatesOnNewBlock(payload);
	Signals.get('newBlock').add(newBlockListener);

	const deleteBlockListener = async (payload) => scheduleDeleteBlock(payload);
	Signals.get('deleteBlock').add(deleteBlockListener);

	const newRoundListener = async (payload) => scheduleUpdatesOnNewRound(payload);
	Signals.get('newRound').add(newRoundListener);
};

module.exports = {
	initEventsScheduler,
};
