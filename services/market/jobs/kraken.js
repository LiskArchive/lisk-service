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
const { reload } = require('../shared/market/sources/kraken');

module.exports = [
	{
		name: 'prices.retrieve.kraken',
		description: 'Fetches up-to-date market prices from Kraken',
		schedule: '* * * * *',
		init: async () => {
			logger.debug('Initializing market prices from Kraken');
			await reload();
		},
		controller: async () => {
			logger.debug('Updating market prices from Kraken');
			await reload();
		},
	},
];
