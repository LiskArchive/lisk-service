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
const { getFinalizedHeight } = require('../../shared/constants');
const { deleteCCU } = require('../../shared/jobs/deleteCCU');

module.exports = [
	{
		name: 'job.delete.ccu',
		description: 'Delete CCUs until the finalized block height.',
		interval: config.job.deleteCCU.interval,
		schedule: config.job.deleteCCU.schedule,
		controller: async () => {
			logger.debug('Deleting CCUs until the finalized block height...');
			try {
				const finalizedHeight = await getFinalizedHeight();
				await deleteCCU(finalizedHeight);
				logger.info('Successfully deleted CCUs until the finalized block height.');
			} catch (err) {
				logger.warn(`'Deleting CCUs failed due to: ${err.message}.`);
			}
		},
	},
];
