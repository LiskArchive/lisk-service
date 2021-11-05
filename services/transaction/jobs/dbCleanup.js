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
const moment = require('moment');

const config = require('../config');
const { prune } = require('../shared/dbMaintenance');

module.exports = [
	{
		name: 'multisig.cleanup.expired',
		description: 'Prunes the DB to remove the expired transactions',
		// schedule: '0 0 * * *', // At midnight everyday
		interval: 10,
		controller: async () => {
			try {
				logger.debug('Job scheduled to prune expired transactions from the DB');
				const params = {
					propBetweens: [{
						property: 'expiresAt',
						to: moment().subtract(config.db.expireInDays, 'days').unix(),
					}],
				};
				await prune(params);
			} catch (err) {
				logger.warn(`Expired multisignature transaction cleanup failed due to: ${err.message}`);
			}
		},
	},
	{
		name: 'multisig.cleanup.rejected',
		description: 'Prunes the DB to remove the rejected transactions',
		schedule: '0 0 * * *', // At midnight everyday
		controller: async () => {
			try {
				logger.debug('Job scheduled to prune rejected transactions from the DB');
				const params = {
					rejected: true,
					propBetweens: [{
						property: 'modifiedAt',
						to: moment().subtract(config.db.expireInDays, 'days').unix(),
					}],
				};
				await prune(params);
			} catch (err) {
				logger.warn(`Rejected multisignature transaction cleanup failed due to: ${err.message}`);
			}
		},
	},
];
