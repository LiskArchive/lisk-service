/*
 * LiskHQ/lisk-service
 * Copyright © 2024 Lisk Foundation
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
const _ = require('lodash');
const { dropDuplicatesDeep } = require('../../../../shared/helpers/array');

describe('Unit tests for array utilities', () => {
	describe('Test dropDuplicates method', () => {
		const isEveryElementUnique = array =>
			array.every((e, i, a) => a.filter(n => _.isEqual(e, n)).length === 1);

		it('Array with duplicates', async () => {
			const input1 = [2, 3, 4, 5, 6, 7];
			const input2 = [5, 7, 9, 11, 13];
			const result = dropDuplicatesDeep(input1.concat(input2));
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBeLessThanOrEqual(input1.length + input2.length);
			expect(isEveryElementUnique(result)).toBeTruthy();
		});

		it('Array with duplicate objects', async () => {
			const input = [{ a: 1 }, { a: 1 }, { a: 1 }, { b: { c: 2 } }, { b: { c: 2 } }];
			const result = dropDuplicatesDeep(input);
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(2);
		});

		it('Array with no duplicates', async () => {
			const input = [2, 3, 4, 5, 6, 7];
			const result = dropDuplicatesDeep(input);
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(input.length);
			expect(isEveryElementUnique(result)).toBeTruthy();
		});

		it('Array with no duplicate objects', async () => {
			const input = [{ a: 1 }, { b: 1 }, { c: 1 }, { b: { c: 2 } }, { b: { c: 200 } }];
			const result = dropDuplicatesDeep(input);
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(5);
		});
	});
});
