/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
	TransferTransaction,
	DelegateTransaction,
	MultisignatureTransaction,
	VoteTransaction,
	UnlockTransaction,
	ProofOfMisbehaviorTransaction,
} = require('../../../services/core/node_modules/@liskhq/lisk-transactions');

const {
	EMAcalc,
	getTransactionInstanceByType,
} = require('../../../services/core/shared/core');

describe('Fee estimation tests', () => {
	describe('getTransactionInstanceByType', () => {
		it('TransferTransaction', async () => {
			const transaction = getTransactionInstanceByType({ type: 8 });
			expect(transaction).toBeInstanceOf(TransferTransaction);
		});

		it('DelegateTransaction', async () => {
			const transaction = getTransactionInstanceByType({ type: 10 });
			expect(transaction).toBeInstanceOf(DelegateTransaction);
		});

		it('MultisignatureTransaction', async () => {
			const transaction = getTransactionInstanceByType({ type: 12 });
			expect(transaction).toBeInstanceOf(MultisignatureTransaction);
		});

		it('VoteTransaction', async () => {
			const transaction = getTransactionInstanceByType({ type: 13 });
			expect(transaction).toBeInstanceOf(VoteTransaction);
		});

		it('UnlockTransaction', async () => {
			const transaction = getTransactionInstanceByType({ type: 14 });
			expect(transaction).toBeInstanceOf(UnlockTransaction);
		});

		it('ProofOfMisbehaviorTransaction', async () => {
			const transaction = getTransactionInstanceByType({ type: 15 });
			expect(transaction).toBeInstanceOf(ProofOfMisbehaviorTransaction);
		});

		it('Invalid Transaction Type', async () => {
			try {
				getTransactionInstanceByType({ type: 999 });
			} catch (err) {
				expect(err).toBeInstanceOf(TypeError);
				expect(err.message).toEqual('TransactionClass is not a constructor');
			}
		});
	});

	describe('calculateBlockSize', () => {
		it('Zero transactions', async () => { });
		it('Non-zero transactions', async () => { });
	});

	describe('calculateWeightedAvg', () => {
		it('Batch of empty blocks', async () => { });
		it('Batch of non-empty blocks', async () => { });
	});

	describe('calulateAvgFeePerByte', () => {
		it('', async () => { });
	});

	describe('calculateFeePerByte', () => {
		it('', async () => { });
	});

	describe('EMA computation', () => {
		it('Zero offset', async () => {
			const feePerByte = {
				low: 3,
				med: 4,
				high: 5,
			};
			const prevFeeEstPerByte = {};

			const response = await EMAcalc(feePerByte, prevFeeEstPerByte);
			expect(response).toEqual({
				feeEstLow: 0.10217999999999999,
				feeEstMed: 0.13624,
				feeEstHigh: 0.1703,
			});
		});

		it('Non-zero offset', async () => {
			const feePerByte = {
				low: 0,
				med: 301.9,
				high: 2364.4,
			};
			const prevFeeEstPerByte = {
				low: 0,
				med: 1000,
				high: 2000,
			};

			const response = await EMAcalc(feePerByte, prevFeeEstPerByte);
			expect(response).toEqual({
				feeEstLow: 0,
				feeEstMed: 976.222714,
				feeEstHigh: 2012.411464,
			});
		});
	});
});
