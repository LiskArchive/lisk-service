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
const { Logger, Signals } = require('lisk-service-framework');

const {
	reloadAllPendingTransactions,
	getTransactionsByBlockID,
	reloadGeneratorsCache,
	getGenerators,
} = require('../shared/dataService');

const logger = Logger();

let localPreviousBlockId;

module.exports = [
	{
		name: 'block.new',
		description: 'Keep the block list up-to-date',
		controller: callback => {
			const newBlockListener = async (payload) => {
				try {
					if (payload && Array.isArray(payload.data)) {
						const [block] = payload.data;
						logger.debug(`New block arrived (${block.id})...`);
						// Fork detection
						if (localPreviousBlockId) {
							if (localPreviousBlockId !== block.previousBlockId) {
								logger.debug(`Fork detected at block height ${localPreviousBlockId}`);
							}
						}
						localPreviousBlockId = block.id;
						reloadAllPendingTransactions();
						callback(payload);
					} else {
						const payloadStr = JSON.stringify(payload);
						logger.warn(`Incorrect payload detected for 'newBlock' signal:\n${payloadStr}`);
					}
				} catch (err) {
					logger.error(`Error occured when processing 'block.new' event:\n${err.stack}`);
				}
			};
			Signals.get('newBlock').add(newBlockListener);
		},
	},
	{
		name: 'transactions.new',
		description: 'Keep newly added transactions list up-to-date',
		controller: callback => {
			const newTransactionsListener = async (payload) => {
				try {
					if (payload && Array.isArray(payload.data)) {
						const [block] = payload.data;
						if (block.numberOfTransactions > 0) {
							logger.debug(`Block (${block.id}) arrived containing ${block.numberOfTransactions} new transactions`);
							const transactionData = await getTransactionsByBlockID(block.id);
							callback(transactionData);
						}
					} else {
						const payloadStr = JSON.stringify(payload);
						logger.warn(`Incorrect payload detected for 'newBlock' signal:\n${payloadStr}`);
					}
				} catch (err) {
					logger.error(`Error occured when processing 'transactions.new' event:\n${err.stack}`);
				}
			};
			Signals.get('newBlock').add(newTransactionsListener);
		},
	},
	{
		name: 'block.delete',
		description: 'Emit the deleted block.',
		controller: callback => {
			const deleteBlockListener = async (payload) => {
				try {
					if (payload && Array.isArray(payload.data)) {
						callback(payload);
					} else {
						const payloadStr = JSON.stringify(payload);
						logger.warn(`Incorrect payload detected for 'deleteBlock' signal:\n${payloadStr}`);
					}
				} catch (err) {
					logger.error(`Error occured when processing 'block.delete' event:\n${err.stack}`);
				}
			};
			Signals.get('deleteBlock').add(deleteBlockListener);
		},
	},
	{
		name: 'transactions.delete',
		description: 'Emit the list of deleted transactions.',
		controller: callback => {
			const deleteTransactionsListener = async (payload) => {
				try {
					if (payload && Array.isArray(payload.data)) {
						callback(payload);
					} else {
						const payloadStr = JSON.stringify(payload);
						logger.warn(`Incorrect payload detected for 'deleteTransactions' signal:\n${payloadStr}`);
					}
				} catch (err) {
					logger.error(`Error occured when processing 'transactions.delete' event:\n${err.stack}`);
				}
			};
			Signals.get('deleteTransactions').add(deleteTransactionsListener);
		},
	},
	{
		name: 'generators.change',
		description: 'Keep generators list up-to-date',
		controller: callback => {
			const generatorsChangeListener = async () => {
				try {
					await reloadGeneratorsCache();
					const generators = await getGenerators({ limit: 103, offset: 0 });
					callback(generators);
				} catch (err) {
					logger.error(`Error occured when processing 'generators.change' event:\n${err.stack}`);
				}
			};
			Signals.get('newBlock').add(generatorsChangeListener);
		},
	},
	{
		name: 'round.change',
		description: 'Track round change updates',
		controller: callback => {
			const newRoundListener = async payload => {
				try {
					logger.debug('Returning all forgers for the new round...');
					callback(payload);
				} catch (err) {
					logger.error(`Error occured when processing 'round.change' event:\n${err.stack}`);
				}
			};
			Signals.get('newRound').add(newRoundListener);
		},
	},
	{
		name: 'index.ready',
		description: 'Returns true when the index is ready',
		controller: callback => {
			const indexStatusListener = async (payload) => {
				logger.debug('Dispatching \'index.ready\' event over websocket');
				callback(payload);
			};
			Signals.get('blockIndexReady').add(indexStatusListener);
		},
	},
];
