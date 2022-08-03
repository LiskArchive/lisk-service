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

const { indexBlockchainMetadata } = require('../shared/metadataIndex');
const { syncRepoWithLatestChanges } = require('../shared/utils/downloadRepository');

module.exports = [
	{
		name: 'update.application.metadata',
		description: 'Keep the blockchain applications metadata up-to-date',
		schedule: '0 */3 * * *', // Every 3 hours
		controller: async () => {
			logger.debug('Refreshing blockchain application metadata...');
			try {
				await syncRepoWithLatestChanges();
				await indexBlockchainMetadata();
			} catch (err) {
				logger.warn(`Refreshing blockchain application metadata failed due to: ${err.message}`);
			}
		},
	},
];
