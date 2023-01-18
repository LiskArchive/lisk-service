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
	Logger,
	Signals,
	Exceptions: { ServiceUnavailableException },
} = require('lisk-service-framework');
const { updatePrices } = require('../shared/market/priceUpdater');

const logger = Logger();

const updateMarketPrices = async (isInitCall = false) => updatePrices()
	.then(() => { if (isInitCall) Signals.get('marketPricesReady').dispatch(true); })
	.catch(err => {
		if (err instanceof ServiceUnavailableException) {
			logger.warn('Unable to fetch market prices from Exchangerateapi right now. Will retry later.');
			return;
		}
		throw err;
	});

module.exports = [
	{
		name: 'prices.update',
		description: 'Keeps the market prices up-to-date',
		interval: 5, // seconds
		init: async () => {
			logger.debug('Initializing market prices');
			await updateMarketPrices(true);
		},
		controller: async () => {
			logger.debug('Job scheduled to maintain updated market prices');
			await updateMarketPrices(true);
		},
	},
];
