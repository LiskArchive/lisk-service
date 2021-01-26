/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const { Logger } = require('lisk-service-framework');

const config = require('../config');
const getDbInstance = require('../shared/database/knex');

const logger = Logger();

module.exports = [
	{
		name: 'init.database.migration',
		description: 'Initiate database migration',
		schedule: '0 0 1 1 *', // Once a year
		updateOnInit: true,
		init: () => {
			logger.info('Initiating DB migrations');
			Object.keys(config.db.collections).forEach(async table => {
				logger.debug(`Creating DB connection for table: ${table}`);
				await getDbInstance(table);
			});
		},
		controller: () => { },
	},
];
