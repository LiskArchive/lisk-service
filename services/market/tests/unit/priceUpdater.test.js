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
const { formatCalculatedRate } = require('../../shared/utils/priceUpdater');

describe('Format rates', () => {
	const rates = [
		0, 1, 1234, 123456, 12345678, 1234567890,
		0.1, 0.1234, 0.123456, 0.12345678, 0.123456789,
		99.1, 99.1234, 99.123456, 99.12345678, 99.123456789,
		'0.1', '0.1234', '0.123456', '0.12345678', '0.123456789',
		'99.1', '99.1234', '99.123456', '99.12345678', '99.123456789',
	];
	const fiatCurrencies = ['EUR', 'USD', 'CHF', 'GBP', 'RUB'];
	const cryptoCurrencies = ['LSK', 'BTC', 'ETH'];

	it('formatCalculatedRate rounds to 4 digits when the currency is FIAT', async () => {
		fiatCurrencies.forEach(targetCurrency => {
			rates.forEach(rate => {
				const formattedPrice = formatCalculatedRate(targetCurrency, rate);
				expect(typeof formattedPrice).toEqual('string');
				expect(formattedPrice.split('.')[1].length).toEqual(4);
			});
		});
	});

	it('formatCalculatedRate rounds to 8 digits when the currency is Crypto', async () => {
		cryptoCurrencies.forEach(targetCurrency => {
			rates.forEach(rate => {
				const formattedPrice = formatCalculatedRate(targetCurrency, rate);
				expect(typeof formattedPrice).toEqual('string');
				expect(formattedPrice.split('.')[1].length).toEqual(8);
			});
		});
	});
});
