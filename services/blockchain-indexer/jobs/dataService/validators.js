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

const {
	reloadValidatorCache,
	isPosModuleRegistered,
} = require('../../shared/dataService');

module.exports = [
	{
		name: 'init.validators',
		description: 'Initialize validators cache',
		init: async () => {
			if (await isPosModuleRegistered()) {
				logger.debug('Initializing validators cache...');
				try {
					await reloadValidatorCache();
					logger.info('Successfully initialized validators cache.');
				} catch (err) {
					logger.warn(`Initializing validators cache failed due to: ${err.stack}`);
				}
			}
		},
	},
];
