/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
	fetchAccountKnowledge,
} = require('../../shared/dataService/knownAccounts');

module.exports = [
	{
		name: 'refresh.accounts.knowledge',
		description: 'Keep the knowledge of accounts up-to-date',
		interval: config.job.refreshAccountsKnowledge.interval,
		schedule: config.job.refreshAccountsKnowledge.schedule,
		init: async () => {
			logger.debug('Initializing accounts knowledge...');
			try {
				await fetchAccountKnowledge();
				logger.info('Successfully initialized accounts knowledge.');
			} catch (err) {
				logger.warn(`Initializing accounts knowledge failed due to: ${err.message}`);
			}
		},
		controller: async () => {
			logger.debug('Reloading accounts knowledge...');
			try {
				await fetchAccountKnowledge();
				logger.info('Successfully reloaded accounts knowledge.');
			} catch (err) {
				logger.warn(`Reloading accounts knowledge failed due to: ${err.message}`);
			}
		},
	},
];
