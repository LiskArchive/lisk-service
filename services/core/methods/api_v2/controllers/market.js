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
const CoreService = require('../../../shared/core');

const getMarketPrices = async () => {
	const marketPrices = {
		data: [],
		meta: {},
	};

	const response = await CoreService.getMarketPrices();
	if (response.data) marketPrices.data = response.data;
	if (response.meta) marketPrices.meta = response.meta;

	return marketPrices;
};

module.exports = {
	getMarketPrices,
};
