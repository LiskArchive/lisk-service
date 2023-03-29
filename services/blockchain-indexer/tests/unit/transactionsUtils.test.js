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
const { normalizeTransaction, getTransactionExecutionStatus } = require('../../shared/utils/transactionsUtils');

const {
	inputTransaction,
	expectedTransaction,
} = require('../constants/transactions');

const {
	validTx,
	eventsForValidTx,
	eventsWithFailStatus,
} = require('../constants/events');

const TRANSACTION_STATUS = Object.freeze({
	SUCCESS: 'success',
	FAIL: 'fail',
});

describe('Test normalizeTransaction method', () => {
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

describe('Test getTransactionExecutionStatus method', () => {
	it('should return transaction execution status -> success', async () => {
		const executionStatus = await getTransactionExecutionStatus(validTx, eventsForValidTx);
		expect(executionStatus).toBe(TRANSACTION_STATUS.SUCCESS);
	});

	it('should return transaction execution status -> fail', async () => {
		const executionStatus = await getTransactionExecutionStatus(validTx, eventsWithFailStatus);
		expect(executionStatus).toBe(TRANSACTION_STATUS.FAIL);
	});

	it('should throw error when event is not available for the transaction', async () => {
		expect(() => getTransactionExecutionStatus(validTx, [])).toThrow();
	});
});
