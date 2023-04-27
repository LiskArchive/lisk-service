/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const http = require('../../src/http');

const getTimestamp = () => (new Date().getTime());

const waitMs = n => new Promise(resolve => {
	setTimeout(() => {
		resolve();
	}, n);
});

beforeEach(() => {
});

const url = 'https://service.lisk.com/api/v3/blocks';

describe('HTTP library is able to send GET request', () => {
	test('with default parameters', async () => {
		const response = await http.request(url);
		expect(response).toHaveProperty('data');
		expect(response.data).toHaveProperty('data');
		expect(response.data).toHaveProperty('meta');
		// expect(response.data).toHaveProperty('links');
	});

	test('by explicitly defining get', async () => {
		const response = await http.get(url);
		expect(response).toHaveProperty('data');
		expect(response.data).toHaveProperty('data');
		expect(response.data).toHaveProperty('meta');
		// expect(response.data).toHaveProperty('links');
	});
});

describe('HTTP library with caching enabled', () => {
	test('supports plain GET request cache', async () => {
		const ttl = 50000;
		const timestamps = [];

		timestamps.push(getTimestamp());
		const originalResponse = await http.request(url, {
			cacheTTL: ttl,
		});

		timestamps.push(getTimestamp());
		const cachedResponse = await http.request(url, {
			cacheTTL: ttl,
		});
		timestamps.push(getTimestamp());

		expect(cachedResponse).toEqual(originalResponse);
		expect(timestamps[2] - timestamps[1]).toBeLessThanOrEqual(7);
	});

	xtest('handles expire time properly', async () => {
		const FIXED_DATA = 'fixed';
		const ttl = 50;
		const timestamps = [];

		timestamps.push(getTimestamp());
		const originalResponse = await http.request(url, {
			cacheTTL: ttl,
		});
		timestamps.push(getTimestamp());

		await waitMs(ttl + 1);

		timestamps.push(getTimestamp());
		const secondResponse = await http.request(url, {
			cacheTTL: 1,
		});
		timestamps.push(getTimestamp());

		// console.log(timestamps.map(t => t - timestamps[0]));

		originalResponse.headers.date = FIXED_DATA;
		secondResponse.headers.date = FIXED_DATA;

		expect(timestamps[1] - timestamps[0]).toBeGreaterThanOrEqual(50);
		expect(timestamps[3] - timestamps[2]).toBeGreaterThanOrEqual(50);
		expect(secondResponse).toEqual(originalResponse);
	});
});

afterAll(async () => {
	await http._destroyCache();
});
