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
				transactions.reclaim.sender.address,
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
				transactions.reclaim.sender.address,
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
				transactions.tokenTransfer.sender.address,
				transactions.tokenTransfer,
			);

			expect(Number(amount)).toBeLessThan(0);
		});

		it('returns null for other transaction types', async () => {
			const amount = normalizeTransactionAmount(
				transactions.vote.sender.address,
				transactions.vote,
			);

			expect(amount).toBeNull();
		});
	});
});
