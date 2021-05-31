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
const { calcTargetPairPrices } = require('../../shared/market/priceUpdater');
const { marketPriceItemSchema } = require('../schemas/marketPriceItem.schema');

const targetPairs = ['LSK_EUR', 'LSK_USD', 'LSK_CHF', 'BTC_EUR', 'BTC_USD', 'BTC_CHF'];
const rawPricesBySource = {
	cryptoExchange1: [
		{ code: 'LSK_BTC', from: 'LSK', to: 'BTC', rate: '0.000095', updateTimestamp: 1622414485, sources: ['cx1'] },
		{ code: 'BTC_EUR', from: 'BTC', to: 'EUR', rate: '28500', updateTimestamp: 1622414485, sources: ['cx1'] },
	],
	cryptoExchange2: [
		{ code: 'BTC_USD', from: 'BTC', to: 'USD', rate: '35000', updateTimestamp: 1622414485, sources: ['cx2'] },
		{ code: 'LSK_EUR', from: 'LSK', to: 'BTC', rate: '2.75', updateTimestamp: 1622414485, sources: ['cx2'] },
	],
	fiatExchange1: [
		{ code: 'EUR_CHF', from: 'EUR', to: 'CHF', rate: '1.10', updateTimestamp: 1622414485, sources: ['fx1'] },
		{ code: 'EUR_USD', from: 'EUR', to: 'USD', rate: '1.22', updateTimestamp: 1622414485, sources: ['fx1'] },
	],
};

describe('Market prices', () => {
	it('Calculates prices properly from raw prices', async () => {
		const targetPairPrices = calcTargetPairPrices(rawPricesBySource, targetPairs);
		expect(Object.keys(targetPairPrices).length).toEqual(targetPairs.length);
		Object.values(targetPairPrices).forEach(prices => {
			expect(prices).toBeInstanceOf(Array);
			expect(prices.length).toBeGreaterThanOrEqual(1);
			prices.forEach(price => marketPriceItemSchema.validate(price));
		});

		// Deep compare the results
		expect(targetPairPrices['LSK_EUR']).toEqual([
			{ code: 'LSK_EUR', from: 'LSK', to: 'BTC', rate: '2.75', updateTimestamp: 1622414485, sources: ['cx2'] },
		]);

		expect(targetPairPrices['LSK_USD']).toEqual([
			{ code: 'LSK_USD', from: 'LSK', to: 'USD', rate: 3.325, updateTimestamp: 1622414485, sources: ['cx1', 'cx2'] },
			{ code: 'LSK_USD', from: 'LSK', to: 'USD', rate: 3.355, updateTimestamp: 1622414485, sources: ['cx2', 'fx1'] },
		]);

		expect(targetPairPrices['LSK_CHF']).toEqual([
			{ code: 'LSK_CHF', from: 'LSK', to: 'CHF', rate: 3.0250000000000004, updateTimestamp: 1622414485, sources: ['cx2', 'fx1'] },
		]);

		expect(targetPairPrices['BTC_EUR']).toEqual([
			{ code: 'BTC_EUR', from: 'BTC', to: 'EUR', rate: '28500', updateTimestamp: 1622414485, sources: ['cx1'] },
		]);

		expect(targetPairPrices['BTC_USD']).toEqual([
			{ code: 'BTC_USD', from: 'BTC', to: 'USD', rate: 34770, updateTimestamp: 1622414485, sources: ['cx1', 'fx1'] },
			{ code: 'BTC_USD', from: 'BTC', to: 'USD', rate: '35000', updateTimestamp: 1622414485, sources: ['cx2'] },
		]);

		expect(targetPairPrices['BTC_CHF']).toEqual([
			{ code: 'BTC_CHF', from: 'BTC', to: 'CHF', rate: 31350.000000000004, updateTimestamp: 1622414485, sources: ['cx1', 'fx1'] }
		]);
	});
});
