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
const core = require('../shared/core');
const config = require('../config');

module.exports = [
	{
		name: 'index.missing.blocks',
		description: 'Keep the blocks index up-to-date',
		schedule: '45 * * * *', // 1 hour interval
		controller: async () => {
			if (config.jobs.missingBlocks.enabled) {
				try {
					logger.debug('Checking for missing blocks in index...');
					await core.indexMissingBlocks();
				} catch (err) {
					logger.warn(`Error occurred while running 'index.missing.blocks' job:\n${err.stack}`);
				}
			}
		},
	},
];
