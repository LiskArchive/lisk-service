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
const { getFinalizedHeight } = require('../../shared/constants');
const { deleteFinalisedCCUMetadata } = require('../../shared/jobs/deleteFinalisedCCUMetadata');

module.exports = [
	{
		name: 'job.delete.finalised.ccu.metadata',
		description: 'Delete CCUs metadata until the finalised block height.',
		interval: config.job.deleteFinalisedCCUMetadata.interval,
		schedule: config.job.deleteFinalisedCCUMetadata.schedule,
		controller: async () => {
			logger.debug('Deleting CCUs metadata until the finalised block height...');
			try {
				const finalizedHeight = await getFinalizedHeight();
				await deleteFinalisedCCUMetadata(finalizedHeight);
				logger.info('Successfully deleted CCUs metadata until the finalised block height.');
			} catch (err) {
				logger.warn(`'Deleting CCUs metadata failed due to: ${err.message}.`);
			}
		},
	},
];
