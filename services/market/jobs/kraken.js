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
const {
	Exceptions: { ServiceUnavailableException },
	Logger,
} = require('lisk-service-framework');

const config = require('../config');
const { reload } = require('../shared/market/sources/kraken');

const logger = Logger();

const reloadMarketPrices = async () => reload()
	.catch(err => {
		if (err instanceof ServiceUnavailableException) {
			logger.warn('Unable to fetch market prices from Kraken right now. Will retry later.');
			return;
		}
		throw err;
	});

module.exports = [
	{
		name: 'prices.retrieve.kraken',
		description: 'Fetches up-to-date market prices from Kraken',
		interval: config.job.refreshKrakenPrices.interval,
		schedule: config.job.refreshKrakenPrices.schedule,
		init: async () => {
			logger.debug('Initializing market prices from Kraken');
			await reloadMarketPrices();
		},
		controller: async () => {
			logger.debug('Job scheduled to update prices from Kraken');
			await reloadMarketPrices();
		},
	},
];
