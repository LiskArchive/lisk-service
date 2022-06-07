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
	beddowsToLsk,
	normalizeTransactionAmount,
	normalizeTransactionFee,
	checkIfSelfTokenTransfer,
} = require('../../shared/helpers/transaction');

const {
	lsk,
	beddows,
	lskInBeddows,
	transactions,
} = require('../constants/transaction');

describe('Transaction utils', () => {
	describe('Validate beddows to LSK conversion', () => {
		it('returns correct LSK value', async () => {
			const inLSK = beddowsToLsk(beddows);

			expect(inLSK).not.toBeNull();
			expect(typeof inLSK).toBe('string');
			expect(inLSK.includes('.')).toBeTruthy();

			const [integer, decimal] = inLSK.split('.');
			expect(beddows.startsWith(integer)).toBeTruthy();
			expect(decimal).toHaveLength(8);

			expect(inLSK).toBe(lsk);
			expect(beddows).toBe(String(Number(inLSK) * lskInBeddows));
		});
	});

	describe('Validate transaction amount is properly normalized', () => {
		it('returns amount in a standardized format for a valid transaction', async () => {
			const amount = normalizeTransactionAmount(
				transactions.reclaim.senderId,
				transactions.reclaim,
			);

			expect(amount).not.toBeNull();
			expect(typeof amount).toBe('string');
			expect(amount.includes('.')).toBeTruthy();

			const [integer, decimal] = amount.split('.');
			expect(transactions.reclaim.asset.amount.startsWith(integer)).toBeTruthy();
			expect(decimal).toHaveLength(8);
		});

		it('returns positive amount value for reclaim transaction', async () => {
			const amount = normalizeTransactionAmount(
				transactions.reclaim.senderId,
				transactions.reclaim,
			);

			expect(Number(amount)).toBeGreaterThan(0);
		});

		it('returns positive amount value for incoming token transfer transaction', async () => {
			const amount = normalizeTransactionAmount(
				transactions.tokenTransfer.asset.recipient.address,
				transactions.tokenTransfer,
			);

			expect(Number(amount)).toBeGreaterThan(0);
		});

		it('returns negative amount value for outgoing token transfer transaction', async () => {
			const amount = normalizeTransactionAmount(
				transactions.tokenTransfer.senderId,
				transactions.tokenTransfer,
			);

			expect(Number(amount)).toBeLessThan(0);
		});

		it('returns positive amount value for incoming self token transfer transaction', async () => {
			const amount = normalizeTransactionAmount(
				transactions.tokenTransferSelf.asset.recipient.address,
				{ ...transactions.tokenTransferSelf, fee: '0', isSelfTokenTransferCredit: true },
			);

			expect(Number(amount)).toBeGreaterThan(0);
		});

		it('returns negative amount value for outgoing self token transfer transaction', async () => {
			const amount = normalizeTransactionAmount(
				transactions.tokenTransferSelf.senderId,
				transactions.tokenTransferSelf,
			);

			expect(Number(amount)).toBeLessThan(0);
		});

		it('returns 0 for other transaction types', async () => {
			const amount = normalizeTransactionAmount(
				transactions.vote.senderId,
				transactions.vote,
			);

			expect(Number(amount)).toBe(0);
		});
	});

	describe('Validate transaction fee is properly normalized', () => {
		it('returns fee in a standardized format for a valid transaction', async () => {
			const fee = normalizeTransactionFee(
				transactions.reclaim.senderId,
				transactions.reclaim,
			);

			expect(fee).not.toBeNull();
			expect(typeof fee).toBe('string');
			expect(fee.includes('.')).toBeTruthy();

			const [, decimal] = fee.split('.');
			expect(decimal).toHaveLength(8);
			expect(Number(transactions.reclaim.fee)).toBe(Math.trunc(Number(fee) * 10 ** 8));
		});

		it('returns 0 fees for a token transfer credit', async () => {
			const fee = normalizeTransactionFee(
				transactions.tokenTransfer.asset.recipient.address,
				transactions.tokenTransfer,
			);

			expect(fee).not.toBeNull();
			expect(typeof fee).toBe('string');
			expect(fee.includes('.')).toBeTruthy();

			const [, decimal] = fee.split('.');
			expect(decimal).toHaveLength(8);
			expect(Number(0)).toBe(Math.trunc(Number(fee) * 10 ** 8));
		});

		it('returns fee in a standardized format for a token transfer debit', async () => {
			const fee = normalizeTransactionFee(
				transactions.tokenTransfer.senderId,
				transactions.tokenTransfer,
			);

			expect(fee).not.toBeNull();
			expect(typeof fee).toBe('string');
			expect(fee.includes('.')).toBeTruthy();

			const [, decimal] = fee.split('.');
			expect(decimal).toHaveLength(8);
			expect(Number(transactions.tokenTransfer.fee)).toBe(Math.trunc(Number(fee) * 10 ** 8));
		});
	});

	describe('Validate checkIfSelfTokenTransfer', () => {
		it('returns false for non-TOKEN TRANSFER transaction', async () => {
			const isSelfTokenTransfer = checkIfSelfTokenTransfer(transactions.reclaim);

			expect(isSelfTokenTransfer).not.toBeNull();
			expect(typeof isSelfTokenTransfer).toBe('boolean');
			expect(isSelfTokenTransfer).toBeFalsy();
		});

		it('returns false for non-self TOKEN TRANSFER transaction', async () => {
			const isSelfTokenTransfer = checkIfSelfTokenTransfer(transactions.tokenTransfer);

			expect(isSelfTokenTransfer).not.toBeNull();
			expect(typeof isSelfTokenTransfer).toBe('boolean');
			expect(isSelfTokenTransfer).toBeFalsy();
		});

		it('returns true for self TOKEN TRANSFER transaction', async () => {
			const isSelfTokenTransfer = checkIfSelfTokenTransfer(transactions.tokenTransferSelf);

			expect(isSelfTokenTransfer).not.toBeNull();
			expect(typeof isSelfTokenTransfer).toBe('boolean');
			expect(isSelfTokenTransfer).toBeTruthy();
		});
	});
});
