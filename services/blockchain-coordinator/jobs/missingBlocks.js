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
	scheduleMissingBlocksIndexing,
} = require('../shared/scheduler');

module.exports = [
	{
		name: 'index.missing.blocks',
		description: 'Verify and update blocks indexing',
		schedule: '*/15 * * * *', // Every 15 min
		controller: async () => {
			logger.debug('Schedule missing blocks indexing...');
			try {
				await scheduleMissingBlocksIndexing();
				logger.info('Successfully scheduled missing blocks indexing');
			} catch (err) {
				logger.warn(`Schedule missing blocks indexing failed due to: ${err.message}`);
			}
		},
	},
];
