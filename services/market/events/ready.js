/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const { Signals } = require('lisk-service-framework');
const { getMarketPrices } = require('../methods/controllers/market');

module.exports = [
	{
		name: 'market.Ready',
		description: 'Returns current readiness status of market microservice',
		controller: async callback => {
			const marketServiceReadyListener = async () => {
				const marketPrices = await getMarketPrices();
				const status = !!marketPrices.data.length;
				callback(status);
			};
			Signals.get('marketPricesReady').add(marketServiceReadyListener);
		},
	},
];
