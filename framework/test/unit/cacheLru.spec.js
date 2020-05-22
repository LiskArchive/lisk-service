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
const Cache = require('../../src/cacheLru');

const customMemoryBank = 'memBank';
const testData = [
	{ test: 'test_value' },
	{ test: 'another_test_value' },
];

test('store value in default memory bank', async () => {
	const cache = Cache();
	const originalData = testData[0];
	await cache.set('key', originalData);
	const result = await cache.get('key');
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
