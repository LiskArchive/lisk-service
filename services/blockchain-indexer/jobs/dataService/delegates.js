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

const { reloadDelegateCache, isDposModuleRegistered } = require('../../shared/dataService');

module.exports = [
	{
		name: 'reload.delegates',
		description: 'Keep the delegate list up-to-date',
		schedule: '*/5 * * * *', // Every 5 min
		init: async () => {
			if (await isDposModuleRegistered) {
				logger.debug('Initializing delegate cache...');
				try {
					await reloadDelegateCache();
					logger.info('Successfully initialized delegate cache');
				} catch (err) {
					logger.warn(`Initializing delegate cache failed due to: ${err.message}`);
				}
			}
		},
		controller: async () => {
			if (await isDposModuleRegistered) {
				logger.debug('Reloading delegate cache...');
				try {
					await reloadDelegateCache();
				} catch (err) {
					logger.warn(`Reloading delegate cache failed due to: ${err.message}`);
				}
			}
		},
	},
];
