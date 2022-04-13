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
const Signals = require('./signals');
const config = require('../config');

const eventsQueue = new MessageQueue(
	config.queue.events.name,
	config.endpoints.messageQueue,
	{ defaultJobOptions: config.queue.defaultJobOptions },
);

const scheduleUpdatesOnNewBlock = async (payload) => {
	const { block, accounts } = payload;
	const addresses = accounts.map(acc => acc.address);
	await eventsQueue.add({ block, addresses, isNewBlock: true });
};

const scheduleDeleteBlock = async (payload) => {
	const { block, accounts } = payload;
	const addresses = accounts.map(acc => acc.address);
	await eventsQueue.add({ block, addresses, isDeleteBlock: true });
};

const scheduleUpdatesOnNewRound = async (payload) => {
	const { validators } = payload;
	await eventsQueue.add({ validators, isNewRound: true });
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
