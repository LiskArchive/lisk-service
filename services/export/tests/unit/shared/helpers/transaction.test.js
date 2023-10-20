/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
	normalizeTransactionAmount,
	normalizeTransactionFee,
	checkIfSelfTokenTransfer,
} = require('../../../../shared/helpers/transaction');

const { transactions } = require('../../../constants/transaction');

describe('Test Transaction utility', () => {
	describe('Validate transaction amount is properly normalized', () => {
		it('should return amount in a standardized format for a valid transaction', async () => {
			const amount = normalizeTransactionAmount(
				transactions.reclaim.sender.address,
				transactions.reclaim,
			);

			expect(amount).not.toBeNull();
			expect(typeof amount).toBe('string');
			expect(amount).toBe(transactions.reclaim.params.amount);
		});

		it('should return positive amount value for reclaim transaction', async () => {
			const amount = normalizeTransactionAmount(
				transactions.reclaim.sender.address,
				transactions.reclaim,
			);

			expect(Number(amount)).toBeGreaterThan(0);
		});

		it('should return positive amount value for incoming token transfer transaction', async () => {
			const amount = normalizeTransactionAmount(
				transactions.tokenTransfer.params.recipientAddress,
				transactions.tokenTransfer,
			);

			expect(Number(amount)).toBeGreaterThan(0);
		});

		it('should return negative amount value for outgoing token transfer transaction', async () => {
			const amount = normalizeTransactionAmount(
				transactions.tokenTransfer.sender.address,
				transactions.tokenTransfer,
			);

			expect(Number(amount)).toBeLessThan(0);
		});

		it('should return positive amount value for incoming self token transfer transaction', async () => {
			const amount = normalizeTransactionAmount(
				transactions.tokenTransferSelf.params.recipientAddress,
				{ ...transactions.tokenTransferSelf, fee: '0', isSelfTokenTransferCredit: true },
			);

			expect(Number(amount)).toBeGreaterThan(0);
		});

		it('should return negative amount value for outgoing self token transfer transaction', async () => {
			const amount = normalizeTransactionAmount(
				transactions.tokenTransferSelf.sender.address,
				transactions.tokenTransferSelf,
			);

			expect(Number(amount)).toBeLessThan(0);
		});

		it('should should return for other transaction types', async () => {
			const amount = normalizeTransactionAmount(
				transactions.stake.sender.address,
				transactions.stake,
			);
			expect(Number(amount)).toBe(0);
		});
	});

	describe('Validate transaction fee is properly normalized', () => {
		it('should return fee in a standardized format for a valid transaction', async () => {
			const fee = normalizeTransactionFee(
				transactions.reclaim.sender.address,
				transactions.reclaim,
			);

			expect(fee).not.toBeNull();
			expect(typeof fee).toBe('string');
			expect(fee).toBe(transactions.reclaim.fee);
		});

		it('should return 0 fees for a token transfer credit', async () => {
			const fee = normalizeTransactionFee(
				transactions.tokenTransfer.params.recipientAddress,
				transactions.tokenTransfer,
			);

			expect(fee).not.toBeNull();
			expect(typeof fee).toBe('string');
			expect(fee).toBe('0');
		});

		it('should return fee in a standardized format for a token transfer debit', async () => {
			const fee = normalizeTransactionFee(
				transactions.tokenTransfer.sender.address,
				transactions.tokenTransfer,
			);

			expect(fee).not.toBeNull();
			expect(typeof fee).toBe('string');
			expect(fee).toBe(transactions.tokenTransfer.fee);
		});
	});

	describe('Validate checkIfSelfTokenTransfer', () => {
		it('should return false for non-TOKEN TRANSFER transaction', async () => {
			const isSelfTokenTransfer = checkIfSelfTokenTransfer(transactions.reclaim);

			expect(isSelfTokenTransfer).not.toBeNull();
			expect(typeof isSelfTokenTransfer).toBe('boolean');
			expect(isSelfTokenTransfer).toBeFalsy();
		});

		it('should return false for non-self TOKEN TRANSFER transaction', async () => {
			const isSelfTokenTransfer = checkIfSelfTokenTransfer(transactions.tokenTransfer);

			expect(isSelfTokenTransfer).not.toBeNull();
			expect(typeof isSelfTokenTransfer).toBe('boolean');
			expect(isSelfTokenTransfer).toBeFalsy();
		});

		it('should return true for self TOKEN TRANSFER transaction', async () => {
			const isSelfTokenTransfer = checkIfSelfTokenTransfer(transactions.tokenTransferSelf);

			expect(isSelfTokenTransfer).not.toBeNull();
			expect(typeof isSelfTokenTransfer).toBe('boolean');
			expect(isSelfTokenTransfer).toBeTruthy();
		});
	});
});
