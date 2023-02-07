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
const { formatValue } = require('../../shared/database/mysqlKVStore');

describe('unit tests for mysqlKVStore', () => {
	describe('unit tests for formatValue', () => {
		it('should return boolean when type is boolean', () => {
			const response1 = formatValue(0, 'boolean');
			expect(response1).toBe(false);
			expect(typeof response1).toBe('boolean');

			const response2 = formatValue(1, 'boolean');
			expect(response2).toBe(true);
			expect(typeof response2).toBe('boolean');

			const response3 = formatValue(true, 'boolean');
			expect(response3).toBe(true);
			expect(typeof response3).toBe('boolean');

			const response4 = formatValue(false, 'boolean');
			expect(response4).toBe(false);
			expect(typeof response4).toBe('boolean');
		});

		it('should return number when type is number', () => {
			const response = formatValue('123', 'number');
			expect(response).toBe(123);
			expect(typeof response).toBe('number');
		});

		it('should return bigint when type is bigint', () => {
			const response = formatValue('123', 'bigint');
			expect(response).toBe(BigInt(123));
			expect(typeof response).toBe('bigint');
		});

		it('should return string when type is string', () => {
			const response = formatValue(123, 'string');
			expect(response).toBe('123');
			expect(typeof response).toBe('string');
		});

		it('should return undefined when type is undefined', () => {
			const response = formatValue(undefined, 'undefined');
			expect(response).toBe(undefined);
			expect(typeof response).toBe('undefined');
		});

		it('should return null when type is null', () => {
			const response = formatValue(null, null);
			expect(response).toBe(null);
			expect(typeof response).toBe('object');
		});
	});
});

