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

const config = require('../config');
const { cacheCleanup } = require('../shared/sdk');

module.exports = [
	{
		name: 'cache.cleanup',
		description: 'Prunes the cache regularly.',
		schedule: '0 */12 * * *', // every 12 hours
		controller: async () => {
			logger.debug('Cleaning cache...');
			try {
				if (config.cachine.isBlockCachingEnabled) {
					logger.info('Starting to clean cache.');
					await cacheCleanup(config.caching.expiryInDays);
					logger.info('Cache has been successfully cleaned.');
				}
			} catch (err) {
				logger.warn(`Cleaning cache failed due to: ${err.message}.`);
			}
		},
	},
];
