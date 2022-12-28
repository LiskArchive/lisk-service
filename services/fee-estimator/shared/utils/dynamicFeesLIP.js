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
const { Logger } = require('lisk-service-framework');

const BluebirdPromise = require('bluebird');

const config = require('../../config');

const logger = Logger();

const calcAvgFeeByteModes = Object.freeze({
	MEDIUM: 'med',
	HIGH: 'high',
});

const EMAcalc = (feePerByte, prevFeeEstPerByte) => {
	const calcExpDecay = (emaBatchSize, emaDecayRate) => (
		1 - Math.pow(1 - emaDecayRate, 1 / emaBatchSize)).toFixed(5);

	const alpha = calcExpDecay(config.feeEstimates.emaBatchSize, config.feeEstimates.emaDecayRate);
	logger.debug(`Estimating fees with 'α' for EMA set to ${alpha}.`);

	const feeEst = {};
	if (Object.keys(prevFeeEstPerByte).length === 0) {
		prevFeeEstPerByte = { low: 0, med: 0, high: 0 };
	}

	Object.keys(feePerByte).forEach((property) => {
		feeEst[property] = alpha * feePerByte[property] + (1 - alpha) * prevFeeEstPerByte[property];
	});

	const EMAoutput = {
		feeEstLow: feeEst.low,
		feeEstMed: feeEst.med,
		feeEstHigh: feeEst.high,
	};
	return EMAoutput;
};

const calculateBlockSize = async block => {
	let blockSize = 0;
	block.transactions.forEach(txn => blockSize += txn.size);
	return blockSize;
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

const calculateWeightedAvg = async blocks => {
	const blockSizes = await BluebirdPromise.map(
		blocks,
		async block => calculateBlockSize(block),
		{ concurrency: blocks.length },
	);
	const decayFactor = 1 - (config.feeEstimates.wavgDecayPercentage / 100);
	let weight = 1;
	let totalWeight = 0;

	const blockSizeSum = blockSizes.reduce(
		(partialBlockSizeSum, blockSize) => {
			partialBlockSizeSum += (blockSize * weight);
			totalWeight += weight;
			weight *= decayFactor;
			return partialBlockSizeSum;
		},
		0,
	);

	const blockSizeWeightedAvg = blockSizeSum / totalWeight;
	return blockSizeWeightedAvg;
};

const calculateFeePerByte = async block => {
	const feePerByte = {};
	const transactionDetails = block.transactions.map(tx => ({
		...tx,
		feePriority: Number(BigInt(tx.fee) - BigInt(tx.minFee)) / tx.size,
	}));

	transactionDetails.sort((t1, t2) => t1.feePriority - t2.feePriority);

	const blockSize = await calculateBlockSize(block);

	feePerByte.low = (blockSize < 12.5 * 2 ** 10) ? 0 : transactionDetails[0].feePriority;
	feePerByte.med = calculateAvgFeePerByte(calcAvgFeeByteModes.MEDIUM, transactionDetails);
	feePerByte.high = Math.max(calculateAvgFeePerByte(calcAvgFeeByteModes.HIGH, transactionDetails),
		(1.3 * feePerByte.med + 1));

	return feePerByte;
};

const getEstimateFeePerByteForBlock = async (blockBatch, innerPrevFeeEstPerByte) => {
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
	feeEstPerByte.blockID = blockBatch.data[0].id;

	return feeEstPerByte;
};

module.exports = {
	getEstimateFeePerByteForBlock,

	// for unit test
	calcAvgFeeByteModes,
	EMAcalc,
	calculateBlockSize,
	calculateFeePerByte,
	calculateWeightedAvg,
};
