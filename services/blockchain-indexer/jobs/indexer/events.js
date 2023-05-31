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

const { getFinalizedHeight } = require('../../shared/constants');
const { deleteEventStrTillHeight } = require('../../shared/utils/events');
const config = require('../../config');

module.exports = [
	{
		name: 'delete.serializedEvents',
		description: 'Delete the serialized events until finalized height.',
		interval: config.job.deleteSerializedEevents.interval,
		schedule: config.job.deleteSerializedEevents.schedule,
		controller: async () => {
			try {
				if (!config.db.isPersistEvents) {
					const finalizedHeight = await getFinalizedHeight();
					logger.debug(`Deleting the serialized events until the finalized height: ${finalizedHeight}.`);
					await deleteEventStrTillHeight(finalizedHeight);
					logger.info(`Deleted the serialized events until the finalized height: ${finalizedHeight}.`);
				}
			} catch (err) {
				logger.warn(`Deleting serialized events failed due to: ${err.message}`);
			}
		},
	},
];
