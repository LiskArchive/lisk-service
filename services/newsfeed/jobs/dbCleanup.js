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
const { prune } = require('../shared/dbMaintenance');

module.exports = [
	{
		name: 'newsfeed.database.cleanup',
		description: 'Prunes the DB regularly to remove the garbage data',
		schedule: '0 0 * * *', // At midnight everyday
		controller: async () => {
			logger.debug('Job scheduled to prune garbage from the DB');
			Object.keys(config.sources)
				.forEach(async source => {
					const sourceName = config.sources[source].name;
					const sourceTable = config.sources[source].table;
					const expiryInDays = config.sources[source].expiryInDays || 30;
					await prune(sourceName, sourceTable, expiryInDays);
				});
		},
	},
];
