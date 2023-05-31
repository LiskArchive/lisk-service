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
const peerCache = require('../shared/sdk/peerCache');

module.exports = [
	{
		name: 'refresh.peers',
		description: 'Keep the peer list up-to-date',
		interval: config.job.refreshPeers.interval,
		schedule: config.job.refreshPeers.schedule,
		init: () => {
			try {
				logger.debug('Initializing peer list...');
				peerCache.reload();
			} catch (err) {
				logger.warn(`Error occurred while running 'refresh.peers' job:\n${err.stack}`);
			}
		},
		controller: () => {
			try {
				logger.debug('Scheduling peer list reload...');
				peerCache.reload();
			} catch (err) {
				logger.warn(`Error occurred while running 'refresh.peers' job:\n${err.stack}`);
			}
		},
	},
];
