#!/usr/bin/env node
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
const { ServiceBroker } = require('moleculer');
const { marketPriceItemSchema } = require('../schemas/marketPriceItem.schema');
const { serviceUnavailableSchema } = require('../schemas/serviceUnavailable.schema');
const config = require('../../config');

const broker = new ServiceBroker({
	transporter: config.transporter,
	logLevel: 'warn',
	requestTimeout: 15 * 1000,
	logger: console,
});

describe('Test market prices', () => {
	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	describe('Connect to client and retrieve market prices', () => {
		it('call market.prices', async () => {
			const result = await broker.call('market.prices', {});
			if (result.data.error) {
				serviceUnavailableSchema.validate(result);
			} else {
				expect(result.data).toBeInstanceOf(Array);
				expect(result.data.length).toBeGreaterThanOrEqual(1);
				result.data.forEach(price => marketPriceItemSchema.validate(price));
				expect(result.meta).toHaveProperty('count');
			}
		});
	});
});
