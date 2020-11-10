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
			logger.debug('Scheduling delegate list init...');
			transactionStatistics.init(config.transactionStatistics.historyLengthDays);
		},
		controller: async () => {
			logger.debug('Scheduling delegate list reload...');
			transactionStatistics.updateTodayStats();
		},
	},
];
