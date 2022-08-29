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
const {
	Logger,
	Signals,
} = require('lisk-service-framework');

const config = require('../config');

const transactionStatistics = require('../shared/transactionStatistics');

const logger = Logger();

module.exports = [
	{
		name: 'refresh.transactions.statistics',
		description: 'Keep the transaction statistics up-to-date',
		schedule: '*/30 * * * *', // Every 30 min
		updateOnInit: true,
		init: async () => {
			const indexReadyListener = async () => {
				try {
					logger.debug('Initiating transaction statistics computation.');
					await transactionStatistics.init(config.transactionStatistics.historyLengthDays);
				} catch (err) {
					logger.warn(`Error occurred while running 'refresh.transactions.statistics' job:\n${err.stack}`);
				}
				Signals.get('blockIndexReady').remove(indexReadyListener);
			};
			Signals.get('blockIndexReady').add(indexReadyListener);
		},
		controller: async () => {
			try {
				logger.debug('Job scheduled to update transaction statistics.');
				await transactionStatistics.updateTodayStats();
			} catch (err) {
				logger.warn(`Error occurred while running 'refresh.transactions.statistics' job:\n${err.stack}`);
			}
		},
	},
	{
		name: 'verify.transactions.statistics',
		description: 'Verify the accuracy and rebuild the transaction statistics, if necessary',
		schedule: '15 */3 * * *', // Every 3 hours at the 15th minute
		controller: async () => {
			try {
				logger.debug('Verifying the transaction stats...');
				await transactionStatistics
					.validateTransactionStatistics(config.transactionStatistics.historyLengthDays);
			} catch (err) {
				logger.warn(`Verifying transaction statistics failed due to: ${err.message}`);
			}
		},
	},
];
