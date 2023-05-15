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
const { isIncludePendingTransactions } = require('../../../../shared/dataService/transactions');

jest.mock('lisk-service-framework', () => {
	const actual = jest.requireActual('lisk-service-framework');
	return {
		...actual,
		CacheRedis: jest.fn(),
		CacheLRU: jest.fn(),
	};
});

describe('Test isIncludePendingTransactions method', () => {
	it('should return true when called with pending execution status', async () => {
		const executionStatus = 'pending,success';
		const result = isIncludePendingTransactions(executionStatus);
		expect(typeof result).toBe('boolean');
		expect(result).toBe(true);
	});

	it('should return false when called without pending execution status', async () => {
		const executionStatus = 'success,fail';
		const result = isIncludePendingTransactions(executionStatus);
		expect(typeof result).toBe('boolean');
		expect(result).toBe(false);
	});

	it('should return false when called with undefined', async () => {
		const result = isIncludePendingTransactions(undefined);
		expect(typeof result).toBe('boolean');
		expect(result).toBe(false);
	});

	it('should return false when called with null', async () => {
		const result = isIncludePendingTransactions(null);
		expect(typeof result).toBe('boolean');
		expect(result).toBe(false);
	});
});
