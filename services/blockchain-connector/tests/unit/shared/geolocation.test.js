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

const { getRandInt } = require('../../../shared/geolocation'); // Replace with the actual path to your file

describe('getRandInt', () => {
	it('should return a value less than max', () => {
		const max = 100;
		const randomValue = getRandInt(max);
		expect(randomValue).toBeLessThan(max);
	});

	it('should return a non-negative value', () => {
		const max = 100;
		const randomValue = getRandInt(max);
		expect(randomValue).toBeGreaterThanOrEqual(0);
	});

	it('should return an integer value', () => {
		const max = 100;
		const randomValue = getRandInt(max);
		expect(Number.isInteger(randomValue)).toBe(true);
	});

	it('should handle max equal to 1', () => {
		const max = 1;
		const randomValue = getRandInt(max);
		expect(randomValue).toBe(0);
	});

	it('should handle large max values', () => {
		const max = 1000000;
		const randomValue = getRandInt(max);
		expect(randomValue).toBeLessThan(max);
	});

	it('should handle consecutive calls', () => {
		const max = 100;
		const randomValue1 = getRandInt(max);
		const randomValue2 = getRandInt(max);
		expect(randomValue1).not.toBe(randomValue2);
	});
});
