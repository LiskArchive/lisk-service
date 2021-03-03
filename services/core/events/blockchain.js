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
const logger = require('lisk-service-framework').Logger();

const core = require('../shared/core');
const signals = require('../shared/signals');

let localPreviousBlockId;

module.exports = [
	{
		name: 'block.change',
		description: 'Keep the block list up-to-date',
		controller: callback => {
			signals.get('newBlock').add(async data => {
				logger.debug(`New block arrived (${data.id})...`);

				// Fork detection
				if (localPreviousBlockId) {
					if (localPreviousBlockId !== data.previousBlockId) {
						logger.debug(`Fork detected at block height ${localPreviousBlockId}`);
					}
				}

				localPreviousBlockId = data.id;

				core.reloadAllPendingTransactions();
				callback(data);
			});
		},
	},
	{
		name: 'transactions.confirmed',
		description: 'Keep confirmed transaction list up-to-date',
		controller: callback => {
			signals.get('newBlock').add(async (block) => {
				if (block.numberOfTransactions > 0) {
					logger.debug(`Block (${block.id}) arrived containing ${block.numberOfTransactions} new transactions`);
					const transactionData = await core.getTransactionsByBlockId(block.id);
					callback(transactionData);
				}
			});
		},
	},
	{
		name: 'forgers.change',
		description: 'Track round change updates',
		controller: callback => {
			signals.get('newBlock').add(async () => {
				await core.reloadNextForgersCache();
				const forgers = await core.getNextForgers({ limit: 25 });
				callback(forgers);
			});
		},
	},
	{
		name: 'round.change',
		description: 'Track round change updates',
		controller: callback => {
			signals.get('newRound').add(async data => {
				logger.debug('New round, updating delegates...');
				core.reloadDelegateCache();
				core.reloadNextForgersCache();
				if (data.timestamp) data.unixtime = await core.getUnixTime(data.timestamp);
				callback(data);
			});
		},
	},
	{
		name: 'update.fee_estimates',
		description: 'Keep the fee estimates up-to-date',
		controller: callback => {
			signals.get('newFeeEstimate').add(async () => {
				logger.debug('Returning latest fee_estimates to the socket.io client...');
				const restData = await core.getEstimateFeeByte();
				callback(restData);
			});
		},
	},
	{
		name: 'update.height_finalized',
		description: 'Keep the block finality height up-to-date',
		controller: callback => {
			signals.get('newBlock').add(async () => {
				logger.debug('Returning latest heightFinalized to the socket.io client...');
				const restData = await core.updateFinalizedHeight();
				callback(restData ? restData.data : null);
			});
		},
	},
];
