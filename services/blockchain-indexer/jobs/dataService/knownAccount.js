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

const {
	reloadKnowledge,
} = require('../../shared/knownAccounts');

module.exports = [
	{
		name: 'reload.knownAccounts',
		description: 'Keep the known accounts list up-to-date',
		schedule: '*/5 * * * *', // Every 5 min
		init: async () => {
			logger.debug('Initializing known accounts cache...');
			try {
				await reloadKnowledge();
				logger.info('Successfully initialized known accounts cache');
			} catch (err) {
				logger.warn(`Initializing known accounts cache failed due to: ${err.message}`);
			}
		},
		controller: async () => {
			logger.debug('Reloading known accounts cache...');
			try {
				await reloadKnowledge();
			} catch (err) {
				logger.warn(`Reloading known accounts cache failed due to: ${err.message}`);
			}
		},
	},
];
