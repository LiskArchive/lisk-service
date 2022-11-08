/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
	emptyBlock,
	nonEmptyBlock,
	fullySaturatedBlock,
} = require('../constants/blocks');

const {
	calculateBlockSize,
	calculateWeightedAvg,
	EMAcalc,
} = require('../../shared/dynamicFees');

const noTrafficMockup = require('../blockGenerator/noTraffic.json');
const lowTrafficMockup = require('../blockGenerator/lowTraffic.json');
const moderateTrafficMockup = require('../blockGenerator/moderateTraffic.json');
const highTrafficMockup = require('../blockGenerator/highTraffic.json');

describe('Fee estimation tests', () => {
	describe('calculateBlockSize', () => {
		it('Zero transactions', async () => {
			const blockSize = await calculateBlockSize(emptyBlock);
			expect(blockSize).toBe(0);
		});

		it('Non-zero transactions', async () => {
			const blockSize = await calculateBlockSize(nonEmptyBlock);
			expect(blockSize).toBeGreaterThan(0);
			expect(blockSize).toBeLessThanOrEqual(15 * 2 ** 10);
		});

		it('Non-zero transactions: Fully saturated block', async () => {
			const blockSize = await calculateBlockSize(fullySaturatedBlock);
			expect(blockSize).not.toBe(0);
			expect(blockSize).toBeGreaterThan(15 * 2 ** 10 - 130);
			expect(blockSize).toBeLessThanOrEqual(15 * 2 ** 10);
		});
	});

	describe('calculateWeightedAvg', () => {
		it('Batch of empty blocks (noTraffic)', async () => {
			const wavg = await calculateWeightedAvg(noTrafficMockup.blocks);
			expect(wavg).toBe(0);
		});

		it('Batch of non-empty blocks (lowTraffic)', async () => {
			const wavg = await calculateWeightedAvg(lowTrafficMockup.blocks);
			expect(wavg).not.toBe(0);
			expect(wavg).toBeCloseTo(1770.111034798482);
		});

		it('Batch of non-empty blocks (moderateTraffic)', async () => {
			const wavg = await calculateWeightedAvg(moderateTrafficMockup.blocks);
			expect(wavg).not.toBe(0);
			expect(wavg).toBeCloseTo(4684.743393978207);
		});

		it('Batch of non-empty blocks (highTraffic)', async () => {
			const wavg = await calculateWeightedAvg(highTrafficMockup.blocks);
			expect(wavg).not.toBe(0);
			expect(wavg).toBeCloseTo(17636.34365733198);
		});

		it('Batch of 20 blocks each having size 15', async () => {
			const blocks = new Array(20).fill(
				{
					transactions: [{ size: 15 }],
				});

			const wavg = await calculateWeightedAvg(blocks);
			expect(wavg).not.toBe(0);
			expect(wavg).toBeCloseTo(15);
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
