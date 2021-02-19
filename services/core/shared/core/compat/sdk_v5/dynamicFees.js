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
const BluebirdPromise = require('bluebird');
const { CacheRedis } = require('lisk-service-framework');

const mysqlIndex = require('../../../indexdb/mysql');

const { getApiClient } = require('../common');
const { calcAvgFeeByteModes, EMAcalc } = require('../common/dynamicFees');
const { getBlocks } = require('./blocks');
const { getTransactions } = require('./transactions');

const config = require('../../../../config');
const blocksIndexSchema = require('./schema/blocks');

const getBlocksIndex = () => mysqlIndex('blocks', blocksIndexSchema);

const cacheRedisFees = CacheRedis('fees', config.endpoints.redis);

const calculateBlockSize = async block => {
	const apiClient = await getApiClient();
	const blocksDB = await getBlocksIndex();

	const [blockInfo] = await blocksDB.find({ id: block.id });
	if (blockInfo) return blockInfo.size;

	let blockSize = 0;
	if (block.numberOfTransactions === 0) return blockSize;

	const transactionSizes = block.payload.map(tx => apiClient.transaction.encode(tx).length);
	blockSize = transactionSizes.reduce((a, b) => a + b, 0);

	return blockSize;
};

const calculateWeightedAvg = async blocks => {
	const blockSizes = await Promise.all(blocks.map(block => calculateBlockSize(block)));
	const decayFactor = config.feeEstimates.wavgDecayPercentage / 100;
	let weight = 1;
	const wavgLastBlocks = blockSizes.reduce((a = 0, b = 0) => {
		weight *= 1 - decayFactor;
		return a + (b * weight);
	});

	return wavgLastBlocks;
};

const calculateAvgFeePerByte = (mode, transactionDetails) => {
	const maxBlockSize = 15 * 2 ** 10;
	const allowedModes = Object.values(calcAvgFeeByteModes);

	const lowerPercentile = allowedModes.includes(mode) && mode === calcAvgFeeByteModes.MEDIUM
		? config.feeEstimates.medEstLowerPercentile : config.feeEstimates.highEstLowerPercentile;
	const upperPercentile = allowedModes.includes(mode) && mode === calcAvgFeeByteModes.MEDIUM
		? config.feeEstimates.medEstUpperPercentile : config.feeEstimates.highEstUpperPercentile;
	const lowerBytePos = Math.ceil((lowerPercentile / 100) * maxBlockSize);
	const upperBytePos = Math.floor((upperPercentile / 100) * maxBlockSize);

	let currentBytePos = 0;
	let totalFeePriority = 0;
	transactionDetails.forEach(transaction => {
		if (currentBytePos <= lowerBytePos && lowerBytePos < currentBytePos + transaction.size
			&& currentBytePos + transaction.size <= upperBytePos) {
			totalFeePriority += transaction.feePriority
				* (currentBytePos + transaction.size - lowerBytePos + 1);
		}

		if (lowerBytePos <= currentBytePos && currentBytePos + transaction.size <= upperBytePos) {
			totalFeePriority += transaction.feePriority * transaction.size;
		}

		if (lowerBytePos <= currentBytePos && upperBytePos >= currentBytePos
			&& upperBytePos <= currentBytePos + transaction.size) {
			totalFeePriority += transaction.feePriority * (upperBytePos - currentBytePos + 1);
		}

		currentBytePos += transaction.size;
	});

	const avgFeePriority = totalFeePriority / (upperBytePos - lowerBytePos + 1);
	return avgFeePriority;
};

const calculateFeePerByte = async block => {
	const apiClient = await getApiClient();

	const feePerByte = {};
	const transactionDetails = block.payload.map(tx => {
		const transactionSize = apiClient.transaction.encode(tx).length;
		const minFee = Number(apiClient.transaction.computeMinFee(tx));
		const feePriority = (Number(tx.fee) - Number(minFee)) / transactionSize;
		return {
			id: tx.id,
			size: transactionSize,
			feePriority,
		};
	});
	transactionDetails.sort((t1, t2) => t1.feePriority - t2.feePriority);

	const blockSize = await calculateBlockSize(block);

	feePerByte.low = (blockSize < 12.5 * 2 ** 10) ? 0 : transactionDetails[0].feePriority;
	feePerByte.med = calculateAvgFeePerByte(calcAvgFeeByteModes.MEDIUM, transactionDetails);
	feePerByte.high = Math.max(calculateAvgFeePerByte(calcAvgFeeByteModes.HIGH, transactionDetails),
		(1.3 * feePerByte.med + 1));

	return feePerByte;
};

const getEstimateFeeByteForBlock = async (blockBatch, innerPrevFeeEstPerByte) => {
	const wavgBlockBatch = await calculateWeightedAvg(blockBatch.data);
	const sizeLastBlock = await calculateBlockSize(blockBatch.data[0]);
	const feePerByte = await calculateFeePerByte(blockBatch.data[0]);
	const feeEstPerByte = {};

	if (wavgBlockBatch > (12.5 * 2 ** 10) || sizeLastBlock > (14.8 * 2 ** 10)) {
		const EMAoutput = EMAcalc(feePerByte, innerPrevFeeEstPerByte);

		feeEstPerByte.low = EMAoutput.feeEstLow;
		feeEstPerByte.med = EMAoutput.feeEstMed;
		feeEstPerByte.high = EMAoutput.feeEstHigh;
	} else {
		feeEstPerByte.low = 0;
		feeEstPerByte.med = 0;
		feeEstPerByte.high = 0;
	}

	feeEstPerByte.updated = Math.floor(Date.now() / 1000);
	feeEstPerByte.blockHeight = blockBatch.data[0].height;
	feeEstPerByte.blockId = blockBatch.data[0].id;

	return feeEstPerByte;
};

const getEstimateFeeByteForBatch = async (fromHeight, toHeight, cacheKey) => {
	// Check if the starting height is permitted by config or adjust acc.
	fromHeight = config.feeEstimates.defaultStartBlockHeight > fromHeight
		? config.feeEstimates.defaultStartBlockHeight : fromHeight;

	const cachedFeeEstimate = await cacheRedisFees.get(cacheKey);

	const cachedFeeEstimateHeight = !cacheKey.includes('Quick') && cachedFeeEstimate
		? cachedFeeEstimate.blockHeight : 0; // 0 implies does not exist

	const prevFeeEstPerByte = fromHeight > cachedFeeEstimateHeight
		? { blockHeight: fromHeight - 1 } : cachedFeeEstimate;

	const range = size => Array(size).fill().map((_, index) => index);
	const feeEstPerByte = {};
	const blockBatch = {};
	do {
		/* eslint-disable no-await-in-loop */
		const idealEMABatchSize = config.feeEstimates.emaBatchSize;
		const finalEMABatchSize = idealEMABatchSize > prevFeeEstPerByte.blockHeight
			? (prevFeeEstPerByte.blockHeight + 1) : idealEMABatchSize;

		blockBatch.data = await BluebirdPromise.map(
			range(finalEMABatchSize),
			async i => (await getBlocks({ height: prevFeeEstPerByte.blockHeight + 1 - i })).data[0],
			{ concurrency: finalEMABatchSize },
		);

		blockBatch.data = await BluebirdPromise.map(
			blockBatch.data,
			async block => {
				const transactions = await getTransactions({ blockId: block.id });
				Object.assign(block, { transactions });
				return block;
			},
			{ concurrency: blockBatch.data.length },
		);

		Object.assign(prevFeeEstPerByte,
			await getEstimateFeeByteForBlock(blockBatch, prevFeeEstPerByte));

		// Store intermediate values, in case of a long running loop
		if (prevFeeEstPerByte.blockHeight < toHeight) {
			await cacheRedisFees.set(cacheKey, prevFeeEstPerByte);
		}

		/* eslint-enable no-await-in-loop */
	} while (toHeight > prevFeeEstPerByte.blockHeight);

	Object.assign(feeEstPerByte, prevFeeEstPerByte);
	await cacheRedisFees.set(cacheKey, feeEstPerByte);

	return feeEstPerByte;
};

module.exports = {
	getEstimateFeeByteForBatch,

	// For unit tests
	calcAvgFeeByteModes,
	calculateBlockSize,
	calculateWeightedAvg,
	calculateAvgFeePerByte,
	calculateFeePerByte,
	getEstimateFeeByteForBlock,
	EMAcalc,
};
