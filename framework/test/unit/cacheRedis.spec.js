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
// TODO: mock Redis
// const { redis } = require('redis-mock');
// jest.doMock('redis', () => redis);

const Cache = require('../../src/cacheRedis');

const customMemoryBank = 'memBank';
const testData = [
	{ test: 'test_value' },
	{ test: 'another_test_value' },
];

const waitMs = (n) => new Promise((resolve) => {
	setTimeout(() => {
		resolve();
	}, n);
});

test('store value in default memory bank', async () => {
	const cache = Cache();
	const originalData = testData[0];
	await cache.set('key', originalData);
	const result = await cache.get('key');
	expect(result).toStrictEqual(originalData);
});

test('store value with a long key', async () => {
	const key = '4c257ae1-944a-4f26-a02c-e4e9439b9c2c';
	const cache = Cache();
	const originalData = testData[0];
	await cache.set(key, originalData);
	const result = await cache.get(key);
	expect(result).toStrictEqual(originalData);
});

test('store value with a key with special chars', async () => {
	const key = 'https://service.lisk.com/api/v1/blocks:{"serialized":"JSON"}';
	const cache = Cache();
	const originalData = testData[0];
	await cache.set(key, originalData);
	const result = await cache.get(key);
	expect(result).toStrictEqual(originalData);
});

test('get value from non-existent key', async () => {
	const cache = Cache();
	const result = await cache.get('unknownKey');
	expect(result).toStrictEqual(undefined);
});

test('store value in a custom memory bank', async () => {
	const cacheDefaultMemBank = Cache();
	const cacheCustomMemBank = Cache(customMemoryBank);
	const defaultData = testData[0];
	const customData = testData[1];
	
	await cacheCustomMemBank.set('key', customData);
	await cacheDefaultMemBank.set('key', defaultData);

	const result = await cacheCustomMemBank.get('key');
	expect(result).toStrictEqual(customData);
});

test('store value with limited validity', async () => {
	const ttl = 500; // ms
	const cache = Cache({ ttl });
	const originalData = testData[0];

	await cache.set('key', originalData, ttl);

	await waitMs(Math.floor(ttl * 0.9));

	const resultCached = await cache.get('key');
	expect(resultCached).toStrictEqual(originalData);

	await waitMs(Math.ceil(ttl * 1.1));

	const resultEmpty = await cache.get('key');
	expect(resultEmpty).toStrictEqual(undefined);
});
