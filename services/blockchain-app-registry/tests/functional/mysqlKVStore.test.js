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
const keyValueTable = require('../../shared/database/mysqlKVStore');

const KEY_1 = 'KEY_1';
const KEY_2 = 'KEY_2';
const VALUE_1 = 'VALUE_1';
const VALUE_2 = 'VALUE_2';

afterEach(async () => {
	await keyValueTable.delete(KEY_1);
	await keyValueTable.delete(KEY_2);
});

describe('test set and get methods', () => {
	it('should set and update value correctly', async () => {
		// Set and check key
		await keyValueTable.set(KEY_1, VALUE_1);
		const response = await keyValueTable.get(KEY_1);
		expect(response).toBe(VALUE_1);

		// Update and check key
		await keyValueTable.set(KEY_1, VALUE_2);
		const response2 = await keyValueTable.get(KEY_1);
		expect(response2).toBe(VALUE_2);
	});
});

describe('test getByPattern method', () => {
	beforeEach(async () => {
		await keyValueTable.set(KEY_1, VALUE_1);
		await keyValueTable.set(KEY_2, VALUE_2);
	});

	it('should return correct response for partial match of same case pattern', async () => {
		// Set and check key
		const response = await keyValueTable.getByPattern('KEY');
		expect(response).toEqual([
			{
				key: KEY_1,
				value: VALUE_1,
			},
			{
				key: KEY_2,
				value: VALUE_2,
			},
		]);
	});

	it('should return correct response for partial match of case insensitive pattern', async () => {
		const response = await keyValueTable.getByPattern('kEy');
		expect(response).toEqual([
			{
				key: KEY_1,
				value: VALUE_1,
			},
			{
				key: KEY_2,
				value: VALUE_2,
			},
		]);
	});

	it('should return correct response for partial match of second key', async () => {
		const response = await keyValueTable.getByPattern('2');
		expect(response).toEqual([
			{
				key: KEY_2,
				value: VALUE_2,
			},
		]);
	});
});

describe('test delete method', () => {
	it('should return undefined after deleting key', async () => {
		await keyValueTable.set(KEY_1, VALUE_1);
		const responseBefore = await keyValueTable.get(KEY_1);
		expect(responseBefore).toEqual(VALUE_1);

		await keyValueTable.delete(KEY_1);
		const responseAfter = await keyValueTable.get(KEY_1);
		expect(responseAfter).toEqual(undefined);
	});

	it('should return undefined after deleting non-existing key', async () => {
		const responseBefore = await keyValueTable.get(KEY_1);
		expect(responseBefore).toEqual(undefined);

		await keyValueTable.delete(KEY_1);
		const responseAfter = await keyValueTable.get(KEY_1);
		expect(responseAfter).toEqual(undefined);
	});
});
