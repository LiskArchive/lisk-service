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
const { normalizeTransaction } = require('../../shared/utils/transactionsUtils');

const {
	inputTransaction,
	expectedTransaction,
} = require('../constants/transactions');

describe('Unit tests for transaction utilities', () => {
	it('should return normalizedTransaction -> valid tx', async () => {
		const normalizedTransaction = await normalizeTransaction(inputTransaction);
		expect(Object.getOwnPropertyNames(normalizedTransaction).length).toBeGreaterThan(0);
		expect(normalizedTransaction).toMatchObject(expectedTransaction);
	});

	it('should throw error -> undefined tx', async () => {
		expect(normalizeTransaction(undefined)).rejects.toThrow();
	});

	it('should throw error -> null tx', async () => {
		expect(normalizeTransaction(null)).rejects.toThrow();
	});
});

