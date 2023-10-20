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

const config = require('../config');
const { scheduleMissingBlocksIndexing } = require('../shared/scheduler');

module.exports = [
	{
		name: 'index.missing.blocks',
		description: 'Verify and update blocks indexing',
		interval: config.job.indexMissingBlocks.interval,
		schedule: config.job.indexMissingBlocks.schedule,
		controller: async () => {
			try {
				logger.debug('Attempting to schedule indexing for the missing blocks.');
				await scheduleMissingBlocksIndexing();
			} catch (err) {
				logger.warn(`Failed to schedule missing blocks indexing due to: ${err.message}.`);
				logger.trace(err.stack);
			}
		},
	},
];
