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

describe('Fee estimation tests', () => {
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

			const feePerByte = await calculateFeePerByte(block);
			expect(feePerByte.low).toBeCloseTo(900);
			expect(feePerByte.med).toBeCloseTo(935.2805624267673);
			expect(feePerByte.high).toBeCloseTo(2651.617312072893);
			expect(feePerByte).toEqual({
				low: 900,
				med: 935.2805624267673,
				high: 2651.617312072893,
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
				expect(feeEstPerByte.low).toBe(0.545484);
				expect(feeEstPerByte.med).toBeCloseTo(71.6996341526711);
				expect(feeEstPerByte.high).toBeCloseTo(118.10034687276278);
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
				expect(feeEstPerByte.low).toBe(0.545484);
				expect(feeEstPerByte.med).toBeCloseTo(1037.639634152671);
				expect(feeEstPerByte.high).toBeCloseTo(2049.9803468727628);
				expect(feeEstPerByte.updated).toBeGreaterThan(Math.floor(Date.now() / 1000) - 1);
				expect(feeEstPerByte.updated).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
				expect(feeEstPerByte.blockHeight).toEqual(blockBatch.data[0].height);
				expect(feeEstPerByte.blockID).toBe(blockBatch.data[0].id);
			});
		});
	});
});
