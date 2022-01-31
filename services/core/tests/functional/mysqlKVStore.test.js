/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
const BluebirdPromise = require('bluebird');

const kvStore = require('../../shared/indexdb/mysqlKVStore');

describe('Test MySQL-based KV-store with', () => {
	const keys = [];

	afterAll(async () => BluebirdPromise.map(
		keys,
		async key => kvStore.delete(key),
		{ concurrency: keys.length },
	));

	it('\'boolean\' type value', async () => {
		const key = 'test_boolean';
		const value = true;
		keys.push(key);

		expect(typeof value).toBe('boolean');
		await kvStore.set(key, value);
		const storedValue = await kvStore.get(key);
		expect(typeof storedValue).toBe('boolean');
		expect(storedValue).toBe(value);
	});

	it('\'number\' type value', async () => {
		const key = 'test_number';
		const value = 16;
		keys.push(key);

		expect(typeof value).toBe('number');
		await kvStore.set(key, value);
		const storedValue = await kvStore.get(key);
		expect(typeof storedValue).toBe('number');
		expect(storedValue).toBe(value);
	});

	it('\'bigint\' type value', async () => {
		const key = 'test_bigint';
		const value = BigInt(23);
		keys.push(key);

		expect(typeof value).toBe('bigint');
		await kvStore.set(key, value);
		const storedValue = await kvStore.get(key);
		expect(typeof storedValue).toBe('bigint');
		expect(storedValue).toBe(value);
	});

	it('\'string\' type value', async () => {
		const key = 'test_string';
		const value = 'it\'s a string';
		keys.push(key);

		expect(typeof value).toBe('string');
		await kvStore.set(key, value);
		const storedValue = await kvStore.get(key);
		expect(typeof storedValue).toBe('string');
		expect(storedValue).toBe(value);
	});

	it('\'undefined\' type value', async () => {
		const key = 'test_undefined';
		const value = undefined;
		keys.push(key);

		expect(typeof value).toBe('undefined');
		await kvStore.set(key, value);
		const storedValue = await kvStore.get(key);
		expect(typeof storedValue).toBe('undefined');
		expect(storedValue).toBe(value);
	});

	it('\'symbol\' type value', async () => {
		const key = 'test_symbol';
		const value = Symbol('testSymbol');

		expect(typeof value).toBe('symbol');
		expect(kvStore.set(key, value)).rejects.toThrowError();
	});

	it('\'function\' type value', async () => {
		const key = 'test_function';
		const value = () => key;

		expect(typeof value).toBe('function');
		expect(kvStore.set(key, value)).rejects.toThrowError();
	});

	it('\'object\' type value', async () => {
		const key = 'test_object';
		const value = { type: 'object' };

		expect(typeof value).toBe('object');
		expect(kvStore.set(key, value)).rejects.toThrowError();
	});
});
