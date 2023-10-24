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
const { getIndexStatus } = require('../../shared/dataService/indexStatus');
const { deleteEventStrTillHeight } = require('../../shared/indexer/utils/events');
const config = require('../../config');

module.exports = [
	{
		name: 'delete.serializedEvents',
		description:
			'Delete the serialized events until the last indexed block or finalized height, whichever is lower.',
		interval: config.job.deleteSerializedEvents.interval,
		schedule: config.job.deleteSerializedEvents.schedule,
		controller: async () => {
			try {
				if (!config.db.isPersistEvents) {
					const { data: { genesisHeight, lastIndexedBlockHeight } = {} } = await getIndexStatus();
					const finalizedHeight = await getFinalizedHeight();

					// Default to 0, when getFinalizedHeight doesn't return response
					const deleteTillHeight = Math.min(
						lastIndexedBlockHeight || genesisHeight || 0,
						finalizedHeight,
					);

					logger.debug(`Deleting the serialized events until the height: ${deleteTillHeight}.`);
					await deleteEventStrTillHeight(deleteTillHeight);
					logger.info(`Deleted the serialized events until the height: ${deleteTillHeight}.`);
				}
			} catch (err) {
				logger.warn(`Deleting serialized events failed due to: ${err.message}`);
			}
		},
	},
];
