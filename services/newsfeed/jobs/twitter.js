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

const config = require('../config');
const refreshTwitterData = require('../shared/twitter');

module.exports = [
	{
		name: 'newsfeed.retrieve.twitter',
		description: 'Retrieves data from Twitter',
		interval: config.sources.twitter_lisk.interval,
		init: async () => {
			logger.debug('Initializing data from Twitter');
			await refreshTwitterData();
		},
		controller: async () => {
			logger.debug('Job scheduled to update data from Twitter');
			await refreshTwitterData();
		},
	},
];
