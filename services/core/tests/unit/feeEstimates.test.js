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
} = require('@liskhq/lisk-transactions');

const { emptyBlock, nonEmptyBlock } = require('../constants/blocks');
const {
	transactionType8,
	transactionType10,
	transactionType12,
	transactionType13,
	transactionType14,
	transactionType15,
} = require('../constants/transactions');

const {
	getTransactionInstanceByType,
	calculateBlockSize,
	calculateWeightedAvg,
	calcAvgFeeByteModes,
	calculateAvgFeePerByte,
	calculateFeePerByte,
	EMAcalc,
} = require('../../shared/core');

const noTrafficMockup = require('../blockGenerator/noTraffic.json');
const highTrafficMockup = require('../blockGenerator/highTraffic.json');


describe('Fee estimation tests', () => {
	describe('getTransactionInstanceByType', () => {
		it('TransferTransaction', async () => {
			const transaction = getTransactionInstanceByType(transactionType8.data[0]);
			expect(transaction).toBeInstanceOf(TransferTransaction);
		});

		it('DelegateTransaction', async () => {
			const transaction = getTransactionInstanceByType(transactionType10.data[0]);
			expect(transaction).toBeInstanceOf(DelegateTransaction);
		});

		it('MultisignatureTransaction', async () => {
			const transaction = getTransactionInstanceByType(transactionType12.data[0]);
			expect(transaction).toBeInstanceOf(MultisignatureTransaction);
		});

		it('VoteTransaction', async () => {
			const transaction = getTransactionInstanceByType(transactionType13.data[0]);
			expect(transaction).toBeInstanceOf(VoteTransaction);
		});

		it('UnlockTransaction', async () => {
			const transaction = getTransactionInstanceByType(transactionType14.data[0]);
			expect(transaction).toBeInstanceOf(UnlockTransaction);
		});

		it('ProofOfMisbehaviorTransaction', async () => {
			const transaction = getTransactionInstanceByType(transactionType15.data[0]);
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
		it('Zero transactions', async () => {
			const blockSize = calculateBlockSize(emptyBlock);
			expect(blockSize).toBe(0);
		});

		it('Non-zero transactions', async () => {
			const blockSize = calculateBlockSize(nonEmptyBlock);
			expect(blockSize).not.toBe(0);
		});
	});

	describe('calculateWeightedAvg', () => {
		it('Batch of empty blocks', async () => {
			const wavg = calculateWeightedAvg(noTrafficMockup.blocks);
			expect(wavg).toBe(0);
		});

		it('Batch of non-empty blocks', async () => {
			const wavg = calculateWeightedAvg(highTrafficMockup.blocks);
			expect(wavg).not.toBe(0);
			expect(wavg).toBeCloseTo(134283.09572095712);
		});
	});

	describe('calulateAvgFeePerByte for Transactions', () => {
		let transactionDetails;
		beforeAll(async () => {
			const payload = nonEmptyBlock.transactions.data;
			transactionDetails = payload.map(transaction => {
				const tx = getTransactionInstanceByType(transaction);
				const transactionSize = tx.getBytes().length;
				const { minFee } = tx;
				const feePriority = (Number(transaction.fee) - Number(minFee)) / transactionSize;
				return {
					id: transaction.id,
					size: transactionSize,
					feePriority,
				};
			});
			transactionDetails.sort((t1, t2) => t1.feePriority - t2.feePriority);
		});

		it('Available computation modes', async () => {
			expect(calcAvgFeeByteModes.MEDIUM).toBe('med');
			expect(calcAvgFeeByteModes.HIGH).toBe('high');
		});

		it('Mode: \'med\'', async () => {
			const avgFeeByte = calculateAvgFeePerByte(
				calcAvgFeeByteModes.MEDIUM,
				transactionDetails,
			);
			expect(avgFeeByte).not.toBe(0);
			expect(avgFeeByte).toBeCloseTo(36.501497200885304);
		});

		it('Mode: \'high\'', async () => {
			const avgFeeByte = calculateAvgFeePerByte(
				calcAvgFeeByteModes.HIGH,
				transactionDetails,
			);
			expect(avgFeeByte).not.toBe(0);
			expect(avgFeeByte).toBeCloseTo(1727.6700292873413);
		});
	});

	describe('calculateFeePerByte for Blocks', () => {
		it('Empty block', async () => {
			const feePerByte = calculateFeePerByte(emptyBlock);
			expect(feePerByte.low).toBe(0);
			expect(feePerByte.med).toBe(0);
			expect(feePerByte.high).toBe(1);
			expect(feePerByte).toEqual({
				low: 0,
				med: 0,
				high: 1,
			});
		});

		it('Non-empty block', async () => {
			const block = nonEmptyBlock;
			block.transactions.data = block.transactions.data.map(transaction => {
				transaction.fee = BigInt(transaction.fee);
				return transaction;
			});

			const feePerByte = calculateFeePerByte(block);
			expect(feePerByte.low).toBeCloseTo(0);
			expect(feePerByte.med).toBeCloseTo(36.501497200885304);
			expect(feePerByte.high).toBeCloseTo(1727.6700292873413);
			expect(feePerByte).toEqual({
				low: 0,
				med: 36.501497200885304,
				high: 1727.6700292873413,
			});
		});
	});

	describe('EMA computation', () => {
		it('Zero offset', async () => {
			const feePerByte = {
				low: 3,
				med: 4,
				high: 5,
			};
			const prevFeeEstPerByte = {};

			const EMAoutput = EMAcalc(feePerByte, prevFeeEstPerByte);
			expect(EMAoutput.feeEstLow).toBeCloseTo(0.10217999999999999);
			expect(EMAoutput.feeEstMed).toBeCloseTo(0.13624);
			expect(EMAoutput.feeEstHigh).toBeCloseTo(0.1703);
			expect(EMAoutput).toEqual({
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

			const EMAoutput = EMAcalc(feePerByte, prevFeeEstPerByte);
			expect(EMAoutput.feeEstLow).toBeCloseTo(0);
			expect(EMAoutput.feeEstMed).toBeCloseTo(976.222714);
			expect(EMAoutput.feeEstHigh).toBeCloseTo(2012.411464);
			expect(EMAoutput).toEqual({
				feeEstLow: 0,
				feeEstMed: 976.222714,
				feeEstHigh: 2012.411464,
			});
		});
	});
});
