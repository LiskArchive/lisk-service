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
const {
	dropDuplicates,
	range,
} = require('../../shared/utils/arrayUtils');

describe('Unit tests for array utilities', () => {
	describe('Test \'range\'', () => {
		it('With single input: length 0', async () => {
			const n = 0;
			const result = range(n);
			expect(result).toBeInstanceOf(Array);
			expect(result).toHaveLength(n);
		});

		it('With single input: length 10', async () => {
			const n = 10;
			const result = range(n);
			expect(result).toBeInstanceOf(Array);
			expect(result).toHaveLength(n);
			expect(Math.min.apply(null, result)).toBe(0);
			expect(Math.max.apply(null, result)).toBeLessThan(n);
			expect(Math.max.apply(null, result)).toBe(n - 1);
		});

		it('With two inputs: start 0, end 5', async () => {
			const start = 0;
			const end = 5;
			const result = range(start, end);
			expect(result).toBeInstanceOf(Array);
			expect(result).toHaveLength(end - start);
			expect(Math.min.apply(null, result)).toBe(start);
			expect(Math.max.apply(null, result)).toBeLessThan(end);
			expect(Math.max.apply(null, result)).toBe(end - 1);
		});

		it('With two inputs: start 3, end 5', async () => {
			const start = 3;
			const end = 5;
			const result = range(start, end);
			expect(result).toBeInstanceOf(Array);
			expect(result).toHaveLength(end - start);
			expect(Math.min.apply(null, result)).toBe(start);
			expect(Math.max.apply(null, result)).toBeLessThan(end);
			expect(Math.max.apply(null, result)).toBe(end - 1);
		});

		it('With three inputs: start 2, end 8, step 1', async () => {
			const start = 2;
			const end = 8;
			const step = 1;
			const result = range(start, end, step);
			expect(result).toBeInstanceOf(Array);
			expect(result).toHaveLength(Math.floor((end - start) / step));
			expect(Math.min.apply(null, result)).toBe(start);
			expect(Math.max.apply(null, result)).toBeLessThan(end);
			expect(Math.max.apply(null, result)).toBe(end - 1 - (end % step));
		});

		it('With three inputs: start 3, end 5, step 1', async () => {
			const start = 3;
			const end = 5;
			const step = 1;
			const result = range(start, end, step);
			expect(result).toBeInstanceOf(Array);
			expect(result).toHaveLength(Math.floor((end - start) / step));
			expect(Math.min.apply(null, result)).toBe(start);
			expect(Math.max.apply(null, result)).toBeLessThan(end);
			expect(Math.max.apply(null, result)).toBe(end - 1 - (end % step));
		});

		it('With three inputs: start 1, end 5, step 2', async () => {
			const start = 1;
			const end = 5;
			const step = 2;
			const result = range(start, end, step);
			expect(result).toBeInstanceOf(Array);
			expect(result).toHaveLength(Math.floor((end - start) / step));
			expect(Math.min.apply(null, result)).toBe(start);
			expect(Math.max.apply(null, result)).toBeLessThan(end);
			expect(Math.max.apply(null, result)).toBe(end - 1 - (end % step));
		});
	});

	describe('Test \'dropDuplicates\'', () => {
		const isEveryElementUnique = (array) => array
			.every((e, i, a) => a.filter(n => n === e).length === 1);

		it('Array with duplicates', async () => {
			const input1 = range(2, 8);
			const input2 = range(5, 15, 2);
			const result = dropDuplicates(input1.concat(input2));
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBeLessThanOrEqual(input1.length + input2.length);
			expect(isEveryElementUnique(result)).toBeTruthy();
		});

		it('Array with no duplicates', async () => {
			const input = range(2, 8);
			const result = dropDuplicates(input);
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(input.length);
			expect(isEveryElementUnique(result)).toBeTruthy();
		});
	});
});
