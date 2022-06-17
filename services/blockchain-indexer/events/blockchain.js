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
const util = require('util');
const { Logger, Signals } = require('lisk-service-framework');

const {
	reloadAllPendingTransactions,
	getTransactionsByBlockId,
	reloadGeneratorsCache,
	getGenerators,
} = require('../shared/dataService');

const logger = Logger();

let localPreviousBlockId;

module.exports = [
	{
		name: 'block.change',
		description: 'Keep the block list up-to-date',
		controller: callback => {
			const newBlockListener = async data => {
				try {
					if (data && Array.isArray(data.data)) {
						const [block] = data.data;
						logger.debug(`New block arrived (${block.id})...`);
						// Fork detection
						if (localPreviousBlockId) {
							if (localPreviousBlockId !== block.previousBlockId) {
								logger.debug(`Fork detected at block height ${localPreviousBlockId}`);
							}
						}
						localPreviousBlockId = block.id;
						reloadAllPendingTransactions();
						callback(data);
					} else {
						logger.warn([
							'Invalid payload received with the newBlock signal: ',
							util.inspect(data),
						].join('\n'));
					}
				} catch (err) {
					logger.error(`Error occured when processing 'block.change' event:\n${err.stack}`);
				}
			};
			Signals.get('newBlock').add(newBlockListener);
		},
	},
	{
		name: 'transactions.new',
		description: 'Keep newly added transactions list up-to-date',
		controller: callback => {
			const newTransactionsListener = async (data) => {
				try {
					if (data && Array.isArray(data.data)) {
						const [block] = data.data;
						if (block.numberOfTransactions > 0) {
							logger.debug(`Block (${block.id}) arrived containing ${block.numberOfTransactions} new transactions`);
							const transactionData = await getTransactionsByBlockId(block.id);
							callback(transactionData);
						}
					}
				} catch (err) {
					logger.error(`Error occured when processing 'transactions.new' event:\n${err.stack}`);
				}
			};
			Signals.get('newBlock').add(newTransactionsListener);
		},
	},
	{
		name: 'generators.change',
		description: 'Keep generators list up-to-date',
		controller: callback => {
			const generatorsChangeListener = async () => {
				try {
					await reloadGeneratorsCache();
					const generators = await getGenerators({ limit: 103 });
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
			const newRoundListener = async data => {
				try {
					logger.debug('Returning all forgers for the new round...');
					callback(data);
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
			const indexStatusListener = async (data) => {
				logger.debug('Dispatching \'index.ready\' event over websocket');
				callback(data);
			};
			Signals.get('blockIndexReady').add(indexStatusListener);
		},
	},
];
