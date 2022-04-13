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

logger.info(`Registering ${config.endpoints.liskWs} for blockchain events`);
const newBlockEvent = async (newBlock) => {
	try {
		const [block] = await normalizeBlocks([newBlock]);
		logger.debug(`New block arrived: ${block.id} at height ${block.height}`);
		performLastBlockUpdate(block);

		logger.debug(`============== Dispatching block to index: ${block.id} at height ${block.height} ==============`);
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
	} catch (err) {
		logger.error(`Error occured when processing 'newBlock' event:\n${err.stack}`);
	}
};

const updateAccountsByAddress = async (accounts) => {
	try {
		logger.debug(`============== 'updateAccountsByAddress' signal: ${Signals.get('updateAccountsByAddress')} ==============`);
		const affectedAccountAddresses = accounts.map(acc => acc.address);
		Signals.get('updateAccountsByAddress').dispatch(affectedAccountAddresses);
	} catch (err) {
		logger.error(`Error occured when processing 'newBlock' event:\n${err.stack}`);
	}
};

const deleteBlockEvent = async (block) => {
	try {
		await deleteBlock(block);
		logger.debug(`============== 'deleteBlock' signal: ${Signals.get('deleteBlock')} ==============`);
		Signals.get('deleteBlock').dispatch({ data: [block] });
	} catch (err) {
		logger.error(`Error occured when processing 'deleteBlock' event:\n${err.stack}`);
	}
};
const newRoundEvent = async () => {
	try {
		await reloadDelegateCache();
		await reloadNextForgersCache();
		const limit = await getNumberOfForgers();
		const nextForgers = await getForgers({ limit, offset: 0 });
		const response = { nextForgers: nextForgers.data.map(forger => forger.address) };
		logger.debug(`============== 'newRound' signal: ${Signals.get('newRound')} ==============`);
		Signals.get('newRound').dispatch(response);
	} catch (err) {
		logger.error(`Error occured when processing 'newRound' event:\n${err.stack}`);
	}
};

module.exports = {
	newBlockEvent,
	updateAccountsByAddress,
	deleteBlockEvent,
	newRoundEvent,
};
