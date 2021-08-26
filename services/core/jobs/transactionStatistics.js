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

const config = require('../config');

const transactionStatistics = require('../shared/core/transactionStatistics');

module.exports = [
	{
		name: 'refresh.transactionstats',
		description: 'Keep the transaction statistics up-to-date',
		schedule: '*/30 * * * *', // Every 30 min
		updateOnInit: true,
		init: () => {
			try {
				if (config.transactionStatistics.enabled) {
					logger.debug('Initiating transaction statistics computation.');
					transactionStatistics.init(config.transactionStatistics.historyLengthDays);
				}
			} catch (err) {
				logger.warn(`Error occurred while running 'refresh.transactionstats' job:\n${err.stack}`);
			}
		},
		controller: async () => {
			try {
				if (config.transactionStatistics.enabled) {
					logger.debug('Job scheduled to update transaction statistics.');
					transactionStatistics.updateTodayStats();
				}
			} catch (err) {
				logger.warn(`Error occurred while running 'refresh.transactionstats' job:\n${err.stack}`);
			}
		},
	},
	{
		name: 'verify.transaction.statistics',
		description: 'Verify the accuracy and rebuild the transaction statistics, if necessary',
		schedule: '15 */3 * * *', // Every 3 hours at the 15th minute
		controller: async () => {
			try {
				if (config.transactionStatistics.enabled) {
					logger.debug('Verifying the transaction stats...');
					await transactionStatistics
						.validateTransactionStatistics(config.transactionStatistics.historyLengthDays);
				}
			} catch (err) {
				logger.warn(`Verifying transaction statistics failed due to: ${err.message}`);
			}
		},
	},
];
