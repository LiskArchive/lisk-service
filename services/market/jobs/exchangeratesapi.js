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
const { reload } = require('../shared/market/sources/exchangeratesapi');
const config = require('../config');

module.exports = [
	{
		name: 'prices.retrieve.exchangeratesapi',
		description: 'Fetches up-to-date market prices from exchangeratesapi',
		schedule: config.sources.exchangeratesapi.cron,
		init: async () => {
			logger.debug('Initializing market prices');
			await reload();
		},
		controller: async () => {
			logger.debug('Job scheduled to update prices from Binance');
			await reload();
		},
	},
];
