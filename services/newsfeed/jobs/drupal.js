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
const { reloadNewsFromDrupal } = require('../shared/drupal');

module.exports = [
	{
		name: 'newsfeed.retrieve.drupal',
		description: 'Retrieves data from Drupal',
		schedule: '* * * * *',
		init: async () => {
			logger.debug('Initializing data from Drupal');
			await reloadNewsFromDrupal();
		},
		controller: async () => {
			logger.debug('Job scheduled to update data from Drupal');
			await reloadNewsFromDrupal();
		},
	},
];
