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

describe('Unit tests for mysqlKVStore', () => {
	describe('Unit tests for formatValue', () => {
		it('Should return boolean when type is boolean', () => {
			const response = formatValue(123, 'boolean');
			expect(response).toBe(true);
			expect(typeof response).toBe('boolean');
		});

		it('Should return number when type is number', () => {
			const response = formatValue('123', 'number');
			expect(response).toBe(123);
			expect(typeof response).toBe('number');
		});

		it('Should return bigint when type is bigint', () => {
			const response = formatValue('123', 'bigint');
			expect(response).toBe(BigInt(123));
			expect(typeof response).toBe('bigint');
		});

		it('Should return string when type is string', () => {
			const response = formatValue(123, 'string');
			expect(response).toBe('123');
			expect(typeof response).toBe('string');
		});

		it('Should return undefined when type is undefined', () => {
			const response = formatValue(undefined, 'undefined');
			expect(response).toBe(undefined);
			expect(typeof response).toBe('undefined');
		});

		it('Should return null when type is null', () => {
			const response = formatValue(null, null);
			expect(response).toBe(null);
			expect(typeof response).toBe('object');
		});
	});
});

