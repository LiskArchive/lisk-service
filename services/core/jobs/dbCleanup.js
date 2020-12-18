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
const logger = require('lisk-service-framework').Logger();

const config = require('../config');
const purger = require('../shared/core/purge');

module.exports = [
	{
		name: 'purge.transactions',
		description: 'Remove old transactions',
		schedule: '0 0 * * *', // Every day at mid-night
		updateOnInit: true,
		init: () => {
			logger.debug('Scheduling delegate list init...');
			purger.purgeTransactions(config.db.collections.transactions.purge_limit);
		},
		controller: async () => {
			logger.debug('Scheduling delegate list reload...');
			purger.purgeTransactions(config.db.collections.transactions.purge_limit);
		},
	},
];
