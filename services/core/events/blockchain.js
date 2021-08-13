/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const { Logger } = require('lisk-service-framework');

const Signals = require('../shared/signals');
const core = require('../shared/core');

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
						core.reloadAllPendingTransactions();
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
							const transactionData = await core.getTransactionsByBlockId(block.id);
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
		name: 'forgers.change',
		description: 'Track round change updates',
		controller: callback => {
			const forgersChangeListener = async () => {
				try {
					await core.reloadNextForgersCache();
					const forgers = await core.getNextForgers({ limit: 25, offset: 0 });
					callback(forgers);
				} catch (err) {
					logger.error(`Error occured when processing 'forgers.change' event:\n${err.stack}`);
				}
			};
			Signals.get('newBlock').add(forgersChangeListener);
		},
	},
	{
		name: 'round.change',
		description: 'Track round change updates',
		controller: callback => {
			const newRoundListener = async data => {
				try {
					logger.debug('Returning all forgers for the new round...');
					if (data.timestamp) data.unixtime = await core.getUnixTime(data.timestamp);
					callback(data);
				} catch (err) {
					logger.error(`Error occured when processing 'round.change' event:\n${err.stack}`);
				}
			};
			Signals.get('newRound').add(newRoundListener);
		},
	},
	{
		name: 'update.fee_estimates',
		description: 'Keep the fee estimates up-to-date',
		controller: callback => {
			const newFeeEstimateListener = async () => {
				try {
					logger.debug('Returning latest fee_estimates to the socket.io client...');
					const restData = await core.getEstimateFeeByte();
					callback(restData);
				} catch (err) {
					logger.error(`Error occured when processing 'update.fee_estimates' event:\n${err.stack}`);
				}
			};
			Signals.get('newFeeEstimate').add(newFeeEstimateListener);
		},
	},
	{
		name: 'update.height_finalized',
		description: 'Keep the block finality height up-to-date',
		controller: callback => {
			const updateFinalizedHeightListener = async () => {
				try {
					logger.debug('Returning latest heightFinalized to the socket.io client...');
					const restData = await core.updateFinalizedHeight();
					callback(restData ? restData.data : null);
				} catch (err) {
					logger.error(`Error occured when processing 'update.height_finalized' event:\n${err.stack}`);
				}
			};
			Signals.get('newBlock').add(updateFinalizedHeightListener);
		},
	},
];
