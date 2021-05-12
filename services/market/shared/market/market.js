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
const { ServiceUnavailableException } = require('../exceptions');

const getMarketPrices = async () => {
	const marketPrices = {
		data: [],
		meta: {},
	};

	// TODO: Place holder for actual implementation
	// const response = await getMarketPricesFromCache();
	// Return mock response for now
	marketPrices.data = [
		{
			code: 'LSK_BTC',
			from: 'LSK',
			rate: '0.00009027',
			to: 'BTC',
			updateTimestamp: 1616939448,
			sources: ['kraken'],
		},
		{
			code: 'LSK_CHF',
			from: 'LSK',
			rate: '35.3452',
			to: 'CHF',
			updateTimestamp: 1616939448,
			sources: ['kraken', 'exchangeratesapi.io'],
		},
	];

	marketPrices.meta = {
		count: 1,
	};

	if (!marketPrices.data.length) throw new ServiceUnavailableException('Service is not ready yet');

	return marketPrices;
};

module.exports = {
	getMarketPrices,
};
