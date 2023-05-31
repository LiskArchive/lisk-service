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
const logger = require('lisk-service-framework').Logger();

const config = require('../../config');

const {
	reloadBlockchainAppsStats,
} = require('../../shared/dataService');

module.exports = [
	{
		name: 'refresh.blockchain.apps.statistics',
		description: 'Keep the blockchain apps statistics up-to-date',
		interval: config.job.refreshBlockchainAppsStats.interval,
		schedule: config.job.refreshBlockchainAppsStats.schedule,
		init: async () => {
			logger.debug('Initializing blockchain apps statistics cache...');
			try {
				await reloadBlockchainAppsStats();
				logger.info('Successfully initialized blockchain apps statistics cache.');
			} catch (err) {
				logger.warn(`Initializing blockchain apps statistics cache failed due to: ${err.message}`);
			}
		},
		controller: async () => {
			logger.debug('Reloading blockchain apps statistics cache...');
			try {
				await reloadBlockchainAppsStats();
			} catch (err) {
				logger.warn(`Reloading blockchain apps statistics cache failed due to: ${err.message}`);
			}
		},
	},
];
