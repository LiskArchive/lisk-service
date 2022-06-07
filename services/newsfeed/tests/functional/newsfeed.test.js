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
const { newsfeedArticleSchema } = require('../schemas/newsfeedArticle.schema');
const { serviceUnavailableSchema } = require('../schemas/serviceUnavailable.schema');
const config = require('../../config');

const broker = new ServiceBroker({
	transporter: config.transporter,
	logLevel: 'warn',
	requestTimeout: 15 * 1000,
	logger: console,
});

describe('Test newsfeed', () => {
	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	describe('Connect to client and retrieve newsfeed articles', () => {
		it('Call newsfeed.articles', async () => {
			const limit = 10;
			const offset = 0;

			const result = await broker.call('newsfeed.articles', { limit, offset });
			if (result.data.error) {
				serviceUnavailableSchema.validate(result);
			} else {
				expect(result.data).toBeInstanceOf(Array);
				expect(result.data.length).toBeGreaterThanOrEqual(1);
				expect(result.data.length).toBeLessThanOrEqual(limit);
				result.data.forEach(article => newsfeedArticleSchema.validate(article));
				expect(result.meta).toHaveProperty('count');
			}
		});
	});
});
