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
} = require('../constants/blocks');

const {
	calculateFeePerByte,
	getEstimateFeeByteForBlock,
} = require('../../shared/dynamicFees');

const noTrafficMockup = require('../blockGenerator/noTraffic.json');
const lowTrafficMockup = require('../blockGenerator/lowTraffic.json');
const moderateTrafficMockup = require('../blockGenerator/moderateTraffic.json');
const highTrafficMockup = require('../blockGenerator/highTraffic.json');

const transformTransactions = (block) => {
	const { transactions } = block;

	block.transactions = transactions.map(transaction => {
		transaction.fee = BigInt(transaction.fee);
		transaction.minFee = BigInt(transaction.size * 1000);
		return transaction;
	});
};

const transformBlocks = (traffic) => {
	traffic.blocks.map(block => transformTransactions(block));
};

describe('Fee estimation tests', () => {
	beforeAll(() => {
		transformTransactions(emptyBlock);
		transformTransactions(nonEmptyBlock);

		transformBlocks(noTrafficMockup);
		transformBlocks(lowTrafficMockup);
		transformBlocks(moderateTrafficMockup);
		transformBlocks(highTrafficMockup);
	});

	describe('calculateFeePerByte for Blocks', () => {
		it('Empty block', async () => {
			const feePerByte = await calculateFeePerByte(emptyBlock);
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
			block.transactions = block.transactions.map(transaction => {
				transaction.fee = BigInt(transaction.fee);
				transaction.minFee = BigInt(transaction.size * 1000);
				return transaction;
			});

			const feePerByte = await calculateFeePerByte(block);
			expect(feePerByte.low).toBeCloseTo(118574);
			expect(feePerByte.med).toBeCloseTo(133569.62114308032);
			expect(feePerByte.high).toBeCloseTo(356178.44126260985);
			expect(feePerByte).toEqual({
				low: 118574,
				med: 133569.62114308032,
				high: 356178.44126260985,
			});
		});
	});

	describe('getEstimateFeeByteForBlock', () => {
		const feeEstPerByteKeys = [
			'low',
			'med',
			'high',
			'updated',
			'blockHeight',
			'blockID',
		];

		describe('Zero prevFeeEstPerByte', () => {
			const prevFeeEstPerByte = {};

			it('No network traffic', async () => {
				const blockBatch = { data: noTrafficMockup.blocks };

				const feeEstPerByte = await getEstimateFeeByteForBlock(blockBatch, prevFeeEstPerByte);
				expect(Object.keys(feeEstPerByte)).toEqual(feeEstPerByteKeys);
				expect(feeEstPerByte.low).toBe(0);
				expect(feeEstPerByte.med).toBe(0);
				expect(feeEstPerByte.high).toBe(0);
				expect(feeEstPerByte.updated).toBeGreaterThan(Math.floor(Date.now() / 1000) - 1);
				expect(feeEstPerByte.updated).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
				expect(feeEstPerByte.blockHeight).toEqual(blockBatch.data[0].height);
				expect(feeEstPerByte.blockID).toBe(blockBatch.data[0].id);
			});

			it('Low network traffic', async () => {
				const blockBatch = { data: lowTrafficMockup.blocks };

				const feeEstPerByte = await getEstimateFeeByteForBlock(blockBatch, prevFeeEstPerByte);
				expect(Object.keys(feeEstPerByte)).toEqual(feeEstPerByteKeys);
				expect(feeEstPerByte.low).toBe(0);
				expect(feeEstPerByte.med).toBe(0);
				expect(feeEstPerByte.high).toBe(0);
				expect(feeEstPerByte.updated).toBeGreaterThan(Math.floor(Date.now() / 1000) - 1);
				expect(feeEstPerByte.updated).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
				expect(feeEstPerByte.blockHeight).toEqual(blockBatch.data[0].height);
				expect(feeEstPerByte.blockID).toBe(blockBatch.data[0].id);
			});

			it('Moderate network traffic', async () => {
				const blockBatch = { data: moderateTrafficMockup.blocks };

				const feeEstPerByte = await getEstimateFeeByteForBlock(blockBatch, prevFeeEstPerByte);
				expect(Object.keys(feeEstPerByte)).toEqual(feeEstPerByteKeys);
				expect(feeEstPerByte.low).toBe(0);
				expect(feeEstPerByte.med).toBeCloseTo(0);
				expect(feeEstPerByte.high).toBeCloseTo(0);
				expect(feeEstPerByte.updated).toBeGreaterThan(Math.floor(Date.now() / 1000) - 1);
				expect(feeEstPerByte.updated).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
				expect(feeEstPerByte.blockHeight).toEqual(blockBatch.data[0].height);
				expect(feeEstPerByte.blockID).toBe(blockBatch.data[0].id);
			});

			it('High network traffic', async () => {
				const blockBatch = { data: highTrafficMockup.blocks };

				const feeEstPerByte = await getEstimateFeeByteForBlock(blockBatch, prevFeeEstPerByte);
				expect(Object.keys(feeEstPerByte)).toEqual(feeEstPerByteKeys);
				expect(feeEstPerByte.low).toBe(3974.87012);
				expect(feeEstPerByte.med).toBeCloseTo(4426.299870069001);
				expect(feeEstPerByte.high).toBeCloseTo(5754.223891089702);
				expect(feeEstPerByte.updated).toBeGreaterThan(Math.floor(Date.now() / 1000) - 1);
				expect(feeEstPerByte.updated).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
				expect(feeEstPerByte.blockHeight).toEqual(blockBatch.data[0].height);
				expect(feeEstPerByte.blockID).toBe(blockBatch.data[0].id);
			});
		});

		describe('Non-zero prevFeeEstPerByte', () => {
			const prevFeeEstPerByte = {
				low: 0,
				med: 1000,
				high: 2000,
			};

			it('No network traffic', async () => {
				const blockBatch = { data: noTrafficMockup.blocks };

				const feeEstPerByte = await getEstimateFeeByteForBlock(blockBatch, prevFeeEstPerByte);
				expect(Object.keys(feeEstPerByte)).toEqual(feeEstPerByteKeys);
				expect(feeEstPerByte.low).toBe(0);
				expect(feeEstPerByte.med).toBe(0);
				expect(feeEstPerByte.high).toBe(0);
				expect(feeEstPerByte.updated).toBeGreaterThan(Math.floor(Date.now() / 1000) - 1);
				expect(feeEstPerByte.updated).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
				expect(feeEstPerByte.blockHeight).toEqual(blockBatch.data[0].height);
				expect(feeEstPerByte.blockID).toBe(blockBatch.data[0].id);
			});

			it('Low network traffic', async () => {
				const blockBatch = { data: lowTrafficMockup.blocks };

				const feeEstPerByte = await getEstimateFeeByteForBlock(blockBatch, prevFeeEstPerByte);
				expect(Object.keys(feeEstPerByte)).toEqual(feeEstPerByteKeys);
				expect(feeEstPerByte.low).toBe(0);
				expect(feeEstPerByte.med).toBe(0);
				expect(feeEstPerByte.high).toBe(0);
				expect(feeEstPerByte.updated).toBeGreaterThan(Math.floor(Date.now() / 1000) - 1);
				expect(feeEstPerByte.updated).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
				expect(feeEstPerByte.blockHeight).toEqual(blockBatch.data[0].height);
				expect(feeEstPerByte.blockID).toBe(blockBatch.data[0].id);
			});

			it('Moderate network traffic', async () => {
				const blockBatch = { data: moderateTrafficMockup.blocks };

				const feeEstPerByte = await getEstimateFeeByteForBlock(blockBatch, prevFeeEstPerByte);
				expect(Object.keys(feeEstPerByte)).toEqual(feeEstPerByteKeys);
				expect(feeEstPerByte.low).toBe(0);
				expect(feeEstPerByte.med).toBeCloseTo(0);
				expect(feeEstPerByte.high).toBeCloseTo(0);
				expect(feeEstPerByte.updated).toBeGreaterThan(Math.floor(Date.now() / 1000) - 1);
				expect(feeEstPerByte.updated).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
				expect(feeEstPerByte.blockHeight).toEqual(blockBatch.data[0].height);
				expect(feeEstPerByte.blockID).toBe(blockBatch.data[0].id);
			});

			it('High network traffic', async () => {
				const blockBatch = { data: highTrafficMockup.blocks };

				const feeEstPerByte = await getEstimateFeeByteForBlock(blockBatch, prevFeeEstPerByte);
				expect(Object.keys(feeEstPerByte)).toEqual(feeEstPerByteKeys);
				expect(feeEstPerByte.low).toBe(3974.87012);
				expect(feeEstPerByte.med).toBeCloseTo(5392.239870069001);
				expect(feeEstPerByte.high).toBeCloseTo(7686.103891089702);
				expect(feeEstPerByte.updated).toBeGreaterThan(Math.floor(Date.now() / 1000) - 1);
				expect(feeEstPerByte.updated).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
				expect(feeEstPerByte.blockHeight).toEqual(blockBatch.data[0].height);
				expect(feeEstPerByte.blockID).toBe(blockBatch.data[0].id);
			});
		});
	});
});
