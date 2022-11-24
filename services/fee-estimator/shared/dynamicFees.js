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
const BluebirdPromise = require('bluebird');

const {
	CacheRedis,
	Logger,
	Signals,
} = require('lisk-service-framework');

const util = require('util');
const { calcAvgFeeByteModes, EMAcalc } = require('./utils/dynamicFees');
const { requestConnector } = require('./utils/request');

const config = require('../config');

const {
	getNetworkFeeConstants,
} = require('./networkConstants');

const cacheKeyFeeEstNormal = 'lastFeeEstimate';
const cacheKeyFeeEstQuick = 'lastFeeEstimateQuick';

const executionStatus = {
	// false: not running, true: running
	[cacheKeyFeeEstNormal]: false,
	[cacheKeyFeeEstQuick]: false,
};

const cacheRedisFees = CacheRedis('fees', config.endpoints.cache);

const logger = Logger();

const calculateBlockSize = async block => {
	let blockSize = 0;
	block.transactions.forEach(txn => blockSize += txn.size);
	return blockSize;
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
	feeEstPerByte.blockID = blockBatch.data[0].id;

	return feeEstPerByte;
};

const getEstimateFeeByteForBatch = async (fromHeight, toHeight, cacheKey) => {
	const genesisHeight = await requestConnector('getGenesisHeight');
	const { defaultStartBlockHeight } = config.feeEstimates;

	// Check if the starting height is permitted by config or adjust acc.
	// Use incrementation to skip the genesis block - it is not needed
	fromHeight = Math.max(...[defaultStartBlockHeight, genesisHeight + 1, fromHeight]
		.filter(n => !Number.isNaN(n)));

	const cachedFeeEstimate = await cacheRedisFees.get(cacheKey);

	const cachedFeeEstimateHeight = !cacheKey.includes('Quick') && cachedFeeEstimate
		? cachedFeeEstimate.blockHeight : 0; // 0 implies does not exist

	const prevFeeEstPerByte = fromHeight > cachedFeeEstimateHeight
		? { blockHeight: fromHeight - 1, low: 0, med: 0, high: 0 } : cachedFeeEstimate;

	const range = size => Array(size).fill().map((_, index) => index);
	const feeEstPerByte = {};
	const blockBatch = {};
	do {
		/* eslint-disable no-await-in-loop */
		const idealEMABatchSize = config.feeEstimates.emaBatchSize;
		const finalEMABatchSize = (() => {
			const maxEMABasedOnHeight = prevFeeEstPerByte.blockHeight - genesisHeight;
			if (idealEMABatchSize > maxEMABasedOnHeight) return maxEMABasedOnHeight + 1;
			return idealEMABatchSize;
		})();

		blockBatch.data = await BluebirdPromise.map(
			range(finalEMABatchSize),
			async i => {
				const { header, transactions } = await requestConnector(
					'getBlockByHeight',
					{ height: prevFeeEstPerByte.blockHeight + 1 - i },
				);
				return { ...header, transactions };
			},
			{ concurrency: 50 },
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

	logger.info(`Recalulated dynamic fees: L: ${feeEstPerByte.low} M: ${feeEstPerByte.med} H: ${feeEstPerByte.high}`);

	return feeEstPerByte;
};

const checkAndProcessExecution = async (fromHeight, toHeight, cacheKey) => {
	let result = await cacheRedisFees.get(cacheKey);
	if (!executionStatus[cacheKey]) {
		try {
			// If the process (normal / quick) is already running,
			// do not allow it to run again until the prior execution finishes
			executionStatus[cacheKey] = true;
			result = await getEstimateFeeByteForBatch(fromHeight, toHeight, cacheKey);
		} catch (err) {
			logger.error(err.stack || err.message);
		} finally {
			executionStatus[cacheKey] = false;
		}
	}
	return result;
};

const calculateEstimateFeeByteNormal = async () => {
	const { header: latestBlock } = await requestConnector('getLastBlock');
	const fromHeight = config.feeEstimates.defaultStartBlockHeight;
	const toHeight = latestBlock.height;

	if (!executionStatus[cacheKeyFeeEstNormal]) {
		logger.debug(`Computing normal fee estimate for block ${latestBlock.id} at height ${latestBlock.height}`);
	} else {
		logger.debug('Compute normal fee estimate is already running. Won\'t start again until the current execution finishes');
	}
	const cachedFeeEstPerByteNormal = await checkAndProcessExecution(
		fromHeight, toHeight, cacheKeyFeeEstNormal,
	);
	return cachedFeeEstPerByteNormal;
};

const calculateEstimateFeeByteQuick = async () => {
	// For the cold start scenario
	const { header: latestBlock } = await requestConnector('getLastBlock');
	const batchSize = config.feeEstimates.coldStartBatchSize;
	const toHeight = latestBlock.height;
	const fromHeight = toHeight - batchSize;

	logger.debug(`Computing quick fee estimate for block ${latestBlock.id} at height ${latestBlock.height}`);
	const cachedFeeEstPerByteQuick = await checkAndProcessExecution(
		fromHeight, toHeight, cacheKeyFeeEstQuick,
	);

	return cachedFeeEstPerByteQuick;
};

const getEstimateFeeByteQuick = () => cacheRedisFees.get(cacheKeyFeeEstNormal);
const getEstimateFeeByteFull = () => cacheRedisFees.get(cacheKeyFeeEstQuick);

const getEstimateFeeByte = async () => { // aka getBestEstimateAvailable
	if (!config.feeEstimates.quickAlgorithmEnabled && !config.feeEstimates.fullAlgorithmEnabled) {
		return {
			data: { error: 'The dynamic fees algorithm has not been enabled.' },
			status: 'SERVICE_UNAVAILABLE',
		};
	}

	const { header: latestBlock } = await requestConnector('getLastBlock');
	const validate = (feeEstPerByte, allowedLag = 0) => feeEstPerByte
		&& ['low', 'med', 'high', 'updated', 'blockHeight', 'blockID']
			.every(key => Object.keys(feeEstPerByte).includes(key))
		&& Number(latestBlock.height) - Number(feeEstPerByte.blockHeight) <= allowedLag;

	const cachedFeeEstPerByteNormal = await getEstimateFeeByteFull();
	logger.debug(`Retrieved regular estimate: ${util.inspect(cachedFeeEstPerByteNormal)}`);
	if (validate(cachedFeeEstPerByteNormal, 15)) return {
		...cachedFeeEstPerByteNormal,
		...getNetworkFeeConstants(),
	};

	const cachedFeeEstPerByteQuick = await getEstimateFeeByteQuick();
	logger.debug(`Retrieved quick estimate: ${util.inspect(cachedFeeEstPerByteQuick)}`);
	if (validate(cachedFeeEstPerByteQuick, 5)) return {
		...cachedFeeEstPerByteQuick,
		...getNetworkFeeConstants(),
	};

	return {
		data: { error: 'The estimates are currently under processing. Please retry in 30 seconds.' },
		status: 'SERVICE_UNAVAILABLE',
	};
};

const newBlockListener = async () => {
	try {
		if (config.feeEstimates.fullAlgorithmEnabled) {
			logger.debug('Initiate the dynamic fee estimates computation (full computation)');
			calculateEstimateFeeByteNormal();
		}
		if (config.feeEstimates.quickAlgorithmEnabled) {
			logger.debug('Initiate the dynamic fee estimates computation (quick algorithm)');
			const feeEstimate = await calculateEstimateFeeByteQuick();
			logger.debug(`============== 'newFeeEstimate' signal: ${Signals.get('newFeeEstimate')} ==============`);
			Signals.get('newFeeEstimate').dispatch(feeEstimate);
		}
	} catch (err) {
		logger.error(`Error occured when processing 'calculateFeeEstimate' event:\n${err.stack}`);
	}
};

Signals.get('newBlock').add(newBlockListener);

module.exports = {
	getEstimateFeeByte,
	getEstimateFeeByteQuick,
	getEstimateFeeByteFull,
	calculateEstimateFeeByteNormal,
	calculateEstimateFeeByteQuick,
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
