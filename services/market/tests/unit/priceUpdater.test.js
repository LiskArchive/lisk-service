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
	formatCalculatedRate,
	calcTargetPairPrices,
} = require('../../shared/market/priceUpdater');
const { marketPriceItemSchema } = require('../schemas/marketPriceItem.schema');

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

describe('Market prices calculation', () => {
	it('Target pairs are a direct match within the raw prices', async () => {
		const targetPairs = ['LSK_BTC', 'LSK_EUR', 'BTC_EUR', 'BTC_USD'];
		const rawPricesBySource = {
			cryptoExchange1: [
				{ code: 'LSK_BTC', from: 'LSK', to: 'BTC', rate: '0.000095', updateTimestamp: 1622414485, sources: ['cx1'] },
				{ code: 'BTC_EUR', from: 'BTC', to: 'EUR', rate: '28500', updateTimestamp: 1622414485, sources: ['cx1'] },
			],
			cryptoExchange2: [
				{ code: 'BTC_USD', from: 'BTC', to: 'USD', rate: '35000', updateTimestamp: 1622414485, sources: ['cx2'] },
				{ code: 'LSK_EUR', from: 'LSK', to: 'BTC', rate: '2.75', updateTimestamp: 1622414485, sources: ['cx2'] },
			],
		};

		const targetPairPrices = calcTargetPairPrices(rawPricesBySource, targetPairs);
		expect(Object.keys(targetPairPrices).length).toEqual(targetPairs.length);
		Object.values(targetPairPrices).forEach(prices => {
			expect(prices).toBeInstanceOf(Array);
			expect(prices.length).toBeGreaterThanOrEqual(1);
			prices.forEach(price => marketPriceItemSchema.validate(price));
		});

		// Deep compare the results
		expect(targetPairPrices.LSK_BTC).toEqual([
			{ code: 'LSK_BTC', from: 'LSK', to: 'BTC', rate: '0.00009500', updateTimestamp: 1622414485, sources: ['cx1'] },
		]);

		expect(targetPairPrices.LSK_EUR).toEqual([
			{ code: 'LSK_EUR', from: 'LSK', to: 'BTC', rate: '2.7500', updateTimestamp: 1622414485, sources: ['cx2'] },
		]);

		expect(targetPairPrices.BTC_EUR).toEqual([
			{ code: 'BTC_EUR', from: 'BTC', to: 'EUR', rate: '28500.0000', updateTimestamp: 1622414485, sources: ['cx1'] },
		]);

		expect(targetPairPrices.BTC_USD).toEqual([
			{ code: 'BTC_USD', from: 'BTC', to: 'USD', rate: '35000.0000', updateTimestamp: 1622414485, sources: ['cx2'] },
		]);
	});

	it('Target pairs are a transitive match of two raw prices', async () => {
		const targetPairs = ['LSK_CHF', 'BTC_CHF'];
		const rawPricesBySource = {
			cryptoExchange1: [
				{ code: 'BTC_EUR', from: 'BTC', to: 'EUR', rate: '28500', updateTimestamp: 1622414485, sources: ['cx1'] },
			],
			cryptoExchange2: [
				{ code: 'LSK_EUR', from: 'LSK', to: 'BTC', rate: '2.75', updateTimestamp: 1622414485, sources: ['cx2'] },
			],
			fiatExchange1: [
				{ code: 'EUR_CHF', from: 'EUR', to: 'CHF', rate: '1.10', updateTimestamp: 1622414485, sources: ['fx1'] },
				{ code: 'EUR_USD', from: 'EUR', to: 'USD', rate: '1.22', updateTimestamp: 1622414485, sources: ['fx1'] },
			],
		};

		const targetPairPrices = calcTargetPairPrices(rawPricesBySource, targetPairs);
		expect(Object.keys(targetPairPrices).length).toEqual(targetPairs.length);
		Object.values(targetPairPrices).forEach(prices => {
			expect(prices).toBeInstanceOf(Array);
			expect(prices.length).toBeGreaterThanOrEqual(1);
			prices.forEach(price => marketPriceItemSchema.validate(price));
		});

		// Deep compare the results
		expect(targetPairPrices.LSK_CHF).toEqual([
			{ code: 'LSK_CHF', from: 'LSK', to: 'CHF', rate: '3.0250', updateTimestamp: 1622414485, sources: ['cx2', 'fx1'] },
		]);

		expect(targetPairPrices.BTC_CHF).toEqual([
			{ code: 'BTC_CHF', from: 'BTC', to: 'CHF', rate: '31350.0000', updateTimestamp: 1622414485, sources: ['cx1', 'fx1'] },
		]);
	});

	it('Target prices are a mixed bag', async () => {
		const targetPairs = ['LSK_BTC', 'LSK_EUR', 'LSK_USD', 'LSK_CHF', 'BTC_EUR', 'BTC_USD', 'BTC_CHF'];
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

		const targetPairPrices = calcTargetPairPrices(rawPricesBySource, targetPairs);
		expect(Object.keys(targetPairPrices).length).toEqual(targetPairs.length);
		Object.values(targetPairPrices).forEach(prices => {
			expect(prices).toBeInstanceOf(Array);
			expect(prices.length).toBeGreaterThanOrEqual(1);
			prices.forEach(price => marketPriceItemSchema.validate(price));
		});

		// Deep compare the results
		expect(targetPairPrices.LSK_BTC).toEqual([
			{ code: 'LSK_BTC', from: 'LSK', to: 'BTC', rate: '0.00009500', updateTimestamp: 1622414485, sources: ['cx1'] },
		]);

		expect(targetPairPrices.LSK_EUR).toEqual([
			{ code: 'LSK_EUR', from: 'LSK', to: 'BTC', rate: '2.7500', updateTimestamp: 1622414485, sources: ['cx2'] },
		]);

		expect(targetPairPrices.LSK_USD).toEqual([
			{ code: 'LSK_USD', from: 'LSK', to: 'USD', rate: '3.3250', updateTimestamp: 1622414485, sources: ['cx1', 'cx2'] },
			{ code: 'LSK_USD', from: 'LSK', to: 'USD', rate: '3.3550', updateTimestamp: 1622414485, sources: ['cx2', 'fx1'] },
		]);

		expect(targetPairPrices.LSK_CHF).toEqual([
			{ code: 'LSK_CHF', from: 'LSK', to: 'CHF', rate: '3.0250', updateTimestamp: 1622414485, sources: ['cx2', 'fx1'] },
		]);

		expect(targetPairPrices.BTC_EUR).toEqual([
			{ code: 'BTC_EUR', from: 'BTC', to: 'EUR', rate: '28500.0000', updateTimestamp: 1622414485, sources: ['cx1'] },
		]);

		expect(targetPairPrices.BTC_USD).toEqual([
			{ code: 'BTC_USD', from: 'BTC', to: 'USD', rate: '35000.0000', updateTimestamp: 1622414485, sources: ['cx2'] },
			{ code: 'BTC_USD', from: 'BTC', to: 'USD', rate: '34770.0000', updateTimestamp: 1622414485, sources: ['cx1', 'fx1'] },
		]);

		expect(targetPairPrices.BTC_CHF).toEqual([
			{ code: 'BTC_CHF', from: 'BTC', to: 'CHF', rate: '31350.0000', updateTimestamp: 1622414485, sources: ['cx1', 'fx1'] },
		]);
	});
});
