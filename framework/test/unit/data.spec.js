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
const {
	isProperObject,
	isEmptyArray,
	isEmptyObject,
	isString,
} = require('../../src/data');

describe('isProperObject()', () => {
	test('returns true on plain objects', async () => {
		expect(isProperObject({})).toBe(true);
		expect(isEmptyObject({ data: 'sample_data' })).toBe(false);
	});

	xtest('returns false on other objects', async () => {
		expect(isProperObject(() => {})).toBe(false);
		expect(isProperObject(null)).toBe(false);
		expect(isProperObject([])).toBe(false);
	});

	test('returns false on non-objects', async () => {
		expect(isProperObject('')).toBe(false);
		expect(isProperObject('string')).toBe(false);
		expect(isProperObject(1234)).toBe(false);
	});
});

describe('isEmptyArray()', () => {
	test('returns true on empty arrays', async () => {
		expect(isEmptyArray([])).toBe(true);
	});

	test('returns false on non-empty arrays', async () => {
		expect(isEmptyArray([1, 2, 3, 4])).toBe(false);
	});

	test('returns false on non-arrays', async () => {
		expect(isEmptyArray('')).toBe(false);
		expect(isEmptyArray('string')).toBe(false);
		expect(isEmptyArray(1234)).toBe(false);
	});
});

describe('isEmptyObject()', () => {
	test('returns true on empty objects', async () => {
		expect(isEmptyObject({})).toBe(true);
	});

	xtest('returns false on non-empty objects', async () => {
		expect(isEmptyObject({ data: 'sample_data' })).toBe(false);
		expect(isEmptyObject(null)).toBe(false);
		expect(isEmptyObject([])).toBe(false);
	});

	test('returns false on non-objects', async () => {
		expect(isEmptyObject('')).toBe(false);
		expect(isEmptyObject('string')).toBe(false);
		expect(isEmptyObject(1234)).toBe(false);
	});
});

describe('isString()', () => {
	test('returns true on strings', async () => {
		expect(isString('')).toBe(true);
		expect(isString('sample_string')).toBe(true);
	});
	
	test('returns false on non-strings', async () => {
		expect(isString({ data: 'sample_data' })).toBe(false);
		expect(isString(null)).toBe(false);
		expect(isString([])).toBe(false);
		expect(isString(1234)).toBe(false);
	});
});
