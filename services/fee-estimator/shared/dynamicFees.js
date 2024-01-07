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
const util = require('util');
const { CacheRedis, Logger, Signals } = require('lisk-service-framework');

const config = require('../config');

const { getFeeConstants } = require('./feeConstants');
const { getLatestBlock } = require('./utils/chain');
const { checkAndProcessExecution, isFeeCalculationRunningInMode } = require('./utils/dynamicFees');

const cacheRedisFees = CacheRedis('fees', config.endpoints.cache);

const logger = Logger();

const calculateEstimateFeePerByteFull = async newBlock => {
	const { header: latestBlock } = newBlock;
	const fromHeight = config.feeEstimates.defaultStartBlockHeight;
	const toHeight = latestBlock.height;

	if (!isFeeCalculationRunningInMode(config.cacheKeys.cacheKeyFeeEstFull)) {
		logger.debug(
			`Computing full fee estimate for block ${latestBlock.id} at height ${latestBlock.height}.`,
		);
	} else {
		logger.debug(
			"Compute full fee estimate is already running. Won't start again until the current execution finishes.",
		);
	}
	const cachedFeeEstPerByteFull = await checkAndProcessExecution(
		fromHeight,
		toHeight,
		config.cacheKeys.cacheKeyFeeEstFull,
	);
	return cachedFeeEstPerByteFull;
};

const calculateEstimateFeePerByteQuick = async newBlock => {
	// For the cold start scenario
	const { header: latestBlock } = newBlock;
	const batchSize = config.feeEstimates.coldStartBatchSize;
	const toHeight = latestBlock.height;
	const fromHeight = toHeight - batchSize;

	logger.debug(
		`Computing quick fee estimate for block ${latestBlock.id} at height ${latestBlock.height}.`,
	);
	const cachedFeeEstPerByteQuick = await checkAndProcessExecution(
		fromHeight,
		toHeight,
		config.cacheKeys.cacheKeyFeeEstQuick,
	);

	return cachedFeeEstPerByteQuick;
};

const getEstimateFeePerByteQuick = () => cacheRedisFees.get(config.cacheKeys.cacheKeyFeeEstFull);
const getEstimateFeePerByteFull = () => cacheRedisFees.get(config.cacheKeys.cacheKeyFeeEstQuick);

const getEstimateFeePerByte = async () => {
	// aka getBestEstimateAvailable
	if (!config.feeEstimates.quickAlgorithmEnabled && !config.feeEstimates.fullAlgorithmEnabled) {
		return {
			data: { error: 'The dynamic fees algorithm has not been enabled.' },
			status: 'SERVICE_UNAVAILABLE',
		};
	}

	const { header: latestBlock } = await getLatestBlock();
	const validate = (feeEstPerByte, allowedLag = 0) =>
		feeEstPerByte &&
		['low', 'med', 'high', 'updated', 'blockHeight', 'blockID'].every(key =>
			Object.keys(feeEstPerByte).includes(key),
		) &&
		Number(latestBlock.height) - Number(feeEstPerByte.blockHeight) <= allowedLag;

	const cachedFeeEstPerByteFull = await getEstimateFeePerByteFull();
	logger.debug(`Retrieved regular estimate: ${util.inspect(cachedFeeEstPerByteFull)}.`);
	if (validate(cachedFeeEstPerByteFull, 15))
		return {
			...cachedFeeEstPerByteFull,
			...(await getFeeConstants()),
		};

	const cachedFeeEstPerByteQuick = await getEstimateFeePerByteQuick();
	logger.debug(`Retrieved quick estimate: ${util.inspect(cachedFeeEstPerByteQuick)}.`);
	if (validate(cachedFeeEstPerByteQuick, 5))
		return {
			...cachedFeeEstPerByteQuick,
			...(await getFeeConstants()),
		};

	return {
		data: { error: 'The estimates are currently under processing. Please retry in 30 seconds.' },
		status: 'SERVICE_UNAVAILABLE',
	};
};

const newBlockListener = async newBlock => {
	try {
		if (config.feeEstimates.fullAlgorithmEnabled) {
			logger.debug('Initiate the dynamic fee estimates computation (full computation).');
			calculateEstimateFeePerByteFull(newBlock);
		}
		if (config.feeEstimates.quickAlgorithmEnabled) {
			logger.debug('Initiate the dynamic fee estimates computation (quick algorithm).');
			const feeEstimate = await calculateEstimateFeePerByteQuick(newBlock);
			logger.debug(
				`============== 'newFeeEstimate' signal: ${Signals.get('newFeeEstimate')} ==============.`,
			);
			Signals.get('newFeeEstimate').dispatch(feeEstimate);
		}
	} catch (err) {
		logger.error(`Error occurred when processing 'calculateFeeEstimate' event:\n${err.stack}.`);
	}
};

Signals.get('newBlock').add(newBlockListener);

module.exports = {
	getEstimateFeePerByte,
};
