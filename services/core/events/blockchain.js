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
const {
	Logger,
	Signals,
} = require('lisk-service-framework');

const core = require('../shared/core');

const logger = Logger();

let localPreviousBlockId;

module.exports = [
	{
		name: 'block.change',
		description: 'Keep the block list up-to-date',
		controller: callback => {
			const newBlockListener = async data => {
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
			};
			if (!Signals.get('newBlock').has(newBlockListener)) {
				logger.debug('newBlock has newBlockListener: ', Signals.get('newBlock').has(newBlockListener));
				Signals.get('newBlock').add(newBlockListener);
				logger.debug('newBlock has now registered newBlockListener: ', Signals.get('newBlock').has(newBlockListener));
			}
		},
	},
	{
		name: 'transactions.new',
		description: 'Keep newly added transactions list up-to-date',
		controller: callback => {
			const newTransactionsListener = async (data) => {
				if (data && Array.isArray(data.data)) {
					const [block] = data.data;
					if (block.numberOfTransactions > 0) {
						logger.debug(`Block (${block.id}) arrived containing ${block.numberOfTransactions} new transactions`);
						const transactionData = await core.getTransactionsByBlockId(block.id);
						callback(transactionData);
					}
				}
			};
			if (!Signals.get('newBlock').has(newTransactionsListener)) {
				logger.debug('newBlock has newTransactionsListener: ', Signals.get('newBlock').has(newTransactionsListener));
				Signals.get('newBlock').add(newTransactionsListener);
				logger.debug('newBlock has now registered newTransactionsListener: ', Signals.get('newBlock').has(newTransactionsListener));
			}
		},
	},
	{
		name: 'forgers.change',
		description: 'Track round change updates',
		controller: callback => {
			const forgersChangeListener = async () => {
				await core.reloadNextForgersCache();
				const forgers = await core.getNextForgers({ limit: 25, offset: 0 });
				callback(forgers);
			};
			if (!Signals.get('newBlock').has(forgersChangeListener)) {
				logger.debug('newBlock has forgersChangeListener: ', Signals.get('newBlock').has(forgersChangeListener));
				Signals.get('newBlock').add(forgersChangeListener);
				logger.debug('newBlock has now registered forgersChangeListener: ', Signals.get('newBlock').has(forgersChangeListener));
			}
		},
	},
	{
		name: 'round.change',
		description: 'Track round change updates',
		controller: callback => {
			const newRoundListener = async data => {
				logger.debug('Returning all forgers for the new round...');
				if (data.timestamp) data.unixtime = await core.getUnixTime(data.timestamp);
				callback(data);
			};
			if (!Signals.get('newRound').has(newRoundListener)) {
				logger.debug('newRound has newRoundListener: ', Signals.get('newRound').has(newRoundListener));
				Signals.get('newRound').add(newRoundListener);
				logger.debug('newRound has now registered newRoundListener: ', Signals.get('newRound').has(newRoundListener));
			}
		},
	},
	{
		name: 'update.fee_estimates',
		description: 'Keep the fee estimates up-to-date',
		controller: callback => {
			const newFeeEstimateListener = async () => {
				logger.debug('Returning latest fee_estimates to the socket.io client...');
				const restData = await core.getEstimateFeeByte();
				callback(restData);
			};
			if (!Signals.get('newFeeEstimate').has(newFeeEstimateListener)) {
				logger.debug('newFeeEstimate has newFeeEstimateListener: ', Signals.get('newFeeEstimate').has(newFeeEstimateListener));
				Signals.get('newFeeEstimate').add(newFeeEstimateListener);
				logger.debug('newFeeEstimate has now registered newFeeEstimateListener: ', Signals.get('newFeeEstimate').has(newFeeEstimateListener));
			}
		},
	},
	{
		name: 'update.height_finalized',
		description: 'Keep the block finality height up-to-date',
		controller: callback => {
			const updateFinalizedHeightListener = async () => {
				logger.debug('Returning latest heightFinalized to the socket.io client...');
				const restData = await core.updateFinalizedHeight();
				callback(restData ? restData.data : null);
			};
			if (!Signals.get('newBlock').has(updateFinalizedHeightListener)) {
				logger.debug('newBlock has updateFinalizedHeightListener: ', Signals.get('newBlock').has(updateFinalizedHeightListener));
				Signals.get('newBlock').add(updateFinalizedHeightListener);
				logger.debug('newBlock has now registered updateFinalizedHeightListener: ', Signals.get('newBlock').has(updateFinalizedHeightListener));
			}
		},
	},
];
