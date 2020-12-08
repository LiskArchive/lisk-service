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
const BluebirdPromise = require('bluebird');
const {
	CacheRedis,
	Logger,
} = require('lisk-service-framework');

const {
	TransferTransaction,
	DelegateTransaction,
	MultisignatureTransaction,
	VoteTransaction,
	UnlockTransaction,
	ProofOfMisbehaviorTransaction,
} = require('@liskhq/lisk-transactions');

const util = require('util');

const { getSDKVersion, getCoreVersion, mapToOriginal } = require('./compat');
const { getBlocks, getLastBlock } = require('./blocks');
const { getTransactions } = require('./transactions');

const config = require('../../config.js');

const sdkVersion = getSDKVersion();
const logger = Logger();

const cacheRedisBlockSizes = CacheRedis('blockSizes', config.endpoints.redis);
const cacheRedisFees = CacheRedis('fees', config.endpoints.redis);
const cacheKeyFeeEstNormal = 'lastFeeEstimate';
const cacheKeyFeeEstQuick = 'lastFeeEstimateQuick';

let execNormalModeOnly = false;
const executionStatus = {
	// false: not running, true: running
	[cacheKeyFeeEstNormal]: false,
	[cacheKeyFeeEstQuick]: false,
};

const calcAvgFeeByteModes = {
	MEDIUM: 'med',
	HIGH: 'high',
};

const getTransactionInstanceByType = transaction => {
	const transactionMap = {
		8: TransferTransaction,
		10: DelegateTransaction,
		12: MultisignatureTransaction,
		13: VoteTransaction,
		14: UnlockTransaction,
		15: ProofOfMisbehaviorTransaction,
	};

	const TransactionClass = transactionMap[transaction.type];
	const tx = new TransactionClass(transaction);
	return tx;
};

const calculateBlockSize = async block => {
	const cachedBlockSize = await cacheRedisBlockSizes.get(block.id);
	if (cachedBlockSize) return cachedBlockSize;

	let blockSize = 0;
	if (block.numberOfTransactions === 0) return blockSize;

	const payload = block.transactions.data;
	const transactionSizes = payload.map(transaction => {
		const tx = getTransactionInstanceByType(transaction);
		const transactionSize = tx.getBytes().length;
		return transactionSize;
	});

	blockSize = transactionSizes.reduce((a, b) => a + b, 0);
	await cacheRedisBlockSizes.set(block.id, blockSize, 300); // Cache for 5 mins

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
	const feePerByte = {};
	const payload = block.transactions.data;
	const transactionDetails = payload.map(transaction => {
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

	const blockSize = await calculateBlockSize(block);

	feePerByte.low = (blockSize < 12.5 * 2 ** 10) ? 0 : transactionDetails[0].feePriority;
	feePerByte.med = calculateAvgFeePerByte(calcAvgFeeByteModes.MEDIUM, transactionDetails);
	feePerByte.high = Math.max(calculateAvgFeePerByte(calcAvgFeeByteModes.HIGH, transactionDetails),
		(1.3 * feePerByte.med + 1));

	return feePerByte;
};

const EMAcalc = (feePerByte, prevFeeEstPerByte) => {
	const calcExpDecay = (emaBatchSize, emaDecayRate) => (
		1 - Math.pow(1 - emaDecayRate, 1 / emaBatchSize)).toFixed(5);

	const alpha = calcExpDecay(config.feeEstimates.emaBatchSize, config.feeEstimates.emaDecayRate);
	logger.debug(`Estimating fees with 'α' for EMA set to ${alpha}.`);

	const feeEst = {};
	if (Object.keys(prevFeeEstPerByte).length === 0) prevFeeEstPerByte = { low: 0, med: 0, high: 0 };
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
				const transactions = mapToOriginal(await getTransactions({ blockId: block.id }), 'transactions');
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

const checkAndProcessExecution = async (fromHeight, toHeight, cacheKey) => {
	if (!execNormalModeOnly) {
		// Stop executing quick mode, after Normal execution catches up
		const feeEstPerByteNormal = await cacheRedisFees.get(cacheKeyFeeEstNormal);
		const feeEstPerByteQuick = await cacheRedisFees.get(cacheKeyFeeEstQuick);
		if (feeEstPerByteNormal && feeEstPerByteQuick
			&& feeEstPerByteNormal.blockHeight >= feeEstPerByteQuick.blockHeight
		) execNormalModeOnly = true;
	}

	let result = await cacheRedisFees.get(cacheKey);
	if (!executionStatus[cacheKey]) {
		// If the process (normal / quick) is already running,
		// do not allow it to run again until the prior execution finishes
		executionStatus[cacheKey] = true;
		result = await getEstimateFeeByteForBatch(fromHeight, toHeight, cacheKey);
		executionStatus[cacheKey] = false;
	}
	return result;
};

const getEstimateFeeByteNormal = async () => {
	const latestBlock = getLastBlock();
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

const getEstimateFeeByteQuick = async () => {
	// For the cold start scenario
	if (execNormalModeOnly) {
		logger.debug('Normal computation mode has caught up. Switching to normal computation mode');
		return getEstimateFeeByteNormal();
	}

	const latestBlock = getLastBlock();
	const batchSize = config.feeEstimates.coldStartBatchSize;
	const toHeight = latestBlock.height;
	const fromHeight = toHeight - batchSize;

	logger.debug(`Computing quick fee estimate for block ${latestBlock.id} at height ${latestBlock.height}`);
	const cachedFeeEstPerByteQuick = await checkAndProcessExecution(
		fromHeight, toHeight, cacheKeyFeeEstQuick,
	);

	return cachedFeeEstPerByteQuick;
};

const getEstimateFeeByte = async () => {
	if (sdkVersion < 4) {
		return {
			data: { error: `Action not supported for Lisk Core version: ${getCoreVersion()}.` },
			status: 'METHOD_NOT_ALLOWED',
		};
	}

	const latestBlock = getLastBlock();
	const validate = (feeEstPerByte, allowedLag = 0) => feeEstPerByte
		&& ['low', 'med', 'high', 'updated', 'blockHeight', 'blockId']
			.every(key => Object.keys(feeEstPerByte).includes(key))
		&& Number(latestBlock.height) - Number(feeEstPerByte.blockHeight) <= allowedLag;

	const cachedFeeEstPerByteNormal = await cacheRedisFees.get(cacheKeyFeeEstNormal);
	logger.debug(`Retrieved regular estimate: ${util.inspect(cachedFeeEstPerByteNormal)}`);
	if (validate(cachedFeeEstPerByteNormal, 15)) return cachedFeeEstPerByteNormal;

	const cachedFeeEstPerByteQuick = await cacheRedisFees.get(cacheKeyFeeEstQuick);
	logger.debug(`Retrieved quick estimate: ${util.inspect(cachedFeeEstPerByteQuick)}`);
	if (validate(cachedFeeEstPerByteQuick, 5)) return cachedFeeEstPerByteQuick;

	return {
		data: { error: 'The estimates are currently under processing. Please retry in 30 seconds.' },
		status: 'SERVICE_UNAVAILABLE',
	};
};

module.exports = {
	EMAcalc,
	getEstimateFeeByte,
	getEstimateFeeByteNormal,
	getEstimateFeeByteQuick,
	getEstimateFeeByteForBlock,
	getTransactionInstanceByType,
	calculateBlockSize,
	calculateFeePerByte,
	calcAvgFeeByteModes,
	calculateAvgFeePerByte,
	calculateWeightedAvg,
};
