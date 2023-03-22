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
const config = require('../../config');

const supportedFiatCurrencies = config.market.supportedFiatCurrencies.split(',');

const formatCalculatedRate = (targetCurrency, rate) => String(
	supportedFiatCurrencies.includes(targetCurrency)
		? Number(rate).toFixed(4) // To fiat - 4 significant digits
		: Number(rate).toFixed(8), // To crypto - 8 significant digits
);

module.exports = {
	formatCalculatedRate,
};
