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
const { updatePrices } = require('../shared/market/priceUpdater');

module.exports = [
	{
		name: 'update.prices',
		description: 'Keeps the market prices up-to-date',
		interval: config.job.updatePrices.interval,
		schedule: config.job.updatePrices.schedule,
		init: async () => {
			logger.debug('Initializing market prices');
			await updatePrices();
		},
		controller: async () => {
			logger.debug('Job scheduled to maintain updated market prices');
			await updatePrices();
		},
	},
];
