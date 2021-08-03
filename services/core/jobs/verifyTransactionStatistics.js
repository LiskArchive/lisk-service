
/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
		name: 'verify.transaction.statistics',
		description: 'Keep the transaction statistics up-to-date',
		schedule: '0 */3 * * *', // Every 3 hours
		controller: async () => {
			if (config.transactionStatistics.enabled) {
				logger.debug('Update transaction stats...');
				await transactionStatistics
					.updateTransactionStatistics(config.transactionStatistics.historyLengthDays);
			}
		},
	},
];
