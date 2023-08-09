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
jest.setTimeout(2147483647);

const axios = require('axios');
const config = require('../../config');

const windowResetTime = 11 * 1000;

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;

const endpoints = [
	`${baseUrlV3}/spec`,
	`${baseUrlV3}/pos/constants`,
	`${baseUrlV3}/reward/constants`,
	`${baseUrlV3}/blockchain/apps/meta/tokens`,
	`${baseUrlV3}/token/constants`,
];

const delay = (ms = windowResetTime) => new Promise(resolve => setTimeout(resolve, ms));

describe('Rate limit', () => {
	let maxRequests;

	beforeAll(async () => {
		const response = await axios.get(endpoints[Math.floor(Math.random() * endpoints.length)]);
		maxRequests = response.headers['x-rate-limit-limit'];

		await delay();
	});

	afterEach(async () => {
		await delay();
	});

	it('should decrease rate limit remaining after each API request', async () => {
		if (maxRequests) {
			const response1 = await axios.get(endpoints[Math.floor(Math.random() * endpoints.length)]);
			const rateLimitRemaining = response1.headers['x-rate-limit-remaining'];

			const response2 = await axios.get(endpoints[Math.floor(Math.random() * endpoints.length)]);
			expect(response2.headers['x-rate-limit-remaining']).toEqual(String(rateLimitRemaining - 1));

			const response3 = await axios.get(endpoints[Math.floor(Math.random() * endpoints.length)]);
			expect(response3.headers['x-rate-limit-remaining']).toEqual(String(rateLimitRemaining - 2));
		}
	});

	it('should not throw timeout error if rate limit is not exceeded', async () => {
		if (maxRequests) {
			const requests = [];

			for (let i = 0; i < maxRequests - 5; i++) {
				const requestPromise = axios.get(endpoints[Math.floor(Math.random() * endpoints.length)]);
				requests.push(requestPromise);
			}

			const responses = await Promise.all(requests);
			responses.forEach((response) => {
				expect(response.status).toBe(200);
			});
		}
	});

	it('should throw timeout error if rate limit is exceeded', async () => {
		if (maxRequests) {
			const requests = [];

			for (let i = 0; i < maxRequests + 5; i++) {
				const requestPromise = axios.get(endpoints[Math.floor(Math.random() * endpoints.length)]);
				requests.push(requestPromise);
			}

			try {
				await Promise.all(requests);
				throw new Error('Rate limit is not exceeded');
			} catch (err) {
				expect(err.message).toContain('ECONNRESET');
			}
		}
	});
});
