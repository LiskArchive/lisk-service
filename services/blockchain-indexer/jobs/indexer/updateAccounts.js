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
const { triggerAccountUpdates } = require('../../shared/indexer/accountIndex');

module.exports = [
	{
		name: 'trigger.account.updates',
		description: 'Triggers the queued account updates.',
		interval: config.job.triggerAccountUpdates.interval,
		schedule: config.job.triggerAccountUpdates.schedule,
		controller: async () => {
			try {
				logger.debug('Triggering account updates.');
				await triggerAccountUpdates();
				logger.info('Triggered account updates successfully.');
			} catch (err) {
				logger.warn(`Triggering account updates failed due to: ${err.message}.`);
				logger.trace(err.stack);
			}
		},
	},
];
