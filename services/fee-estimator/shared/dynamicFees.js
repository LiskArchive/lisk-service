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
	CacheRedis,
	Logger,
	Signals,
} = require('lisk-service-framework');

const util = require('util');
const { requestConnector } = require('./utils/request');

const config = require('../config');

const {
	getFeeConstants,
} = require('./feeConstants');

const {
	checkAndProcessExecution,
	isFeeCalculationRunningInMode,
} = require('./utils/dynamicFees');

const cacheRedisFees = CacheRedis('fees', config.endpoints.cache);

const logger = Logger();

const calculateEstimateFeeByteFull = async () => {
	const { header: latestBlock } = await requestConnector('getLastBlock');
	const fromHeight = config.feeEstimates.defaultStartBlockHeight;
	const toHeight = latestBlock.height;

	if (!isFeeCalculationRunningInMode(config.cacheKeys.cacheKeyFeeEstFull)) {
		logger.debug(`Computing full fee estimate for block ${latestBlock.id} at height ${latestBlock.height}.`);
	} else {
		logger.debug('Compute full fee estimate is already running. Won\'t start again until the current execution finishes.');
	}
	const cachedFeeEstPerByteFull = await checkAndProcessExecution(
		fromHeight, toHeight, config.cacheKeys.cacheKeyFeeEstFull,
	);
	return cachedFeeEstPerByteFull;
};

const calculateEstimateFeeByteQuick = async () => {
	// For the cold start scenario
	const { header: latestBlock } = await requestConnector('getLastBlock');
	const batchSize = config.feeEstimates.coldStartBatchSize;
	const toHeight = latestBlock.height;
	const fromHeight = toHeight - batchSize;

	logger.debug(`Computing quick fee estimate for block ${latestBlock.id} at height ${latestBlock.height}`);
	const cachedFeeEstPerByteQuick = await checkAndProcessExecution(
		fromHeight, toHeight, config.cacheKeys.cacheKeyFeeEstQuick,
	);

	return cachedFeeEstPerByteQuick;
};

const getEstimateFeeByteQuick = () => cacheRedisFees.get(config.cacheKeys.cacheKeyFeeEstFull);
const getEstimateFeeByteFull = () => cacheRedisFees.get(config.cacheKeys.cacheKeyFeeEstQuick);

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

	const cachedFeeEstPerByteFull = await getEstimateFeeByteFull();
	logger.debug(`Retrieved regular estimate: ${util.inspect(cachedFeeEstPerByteFull)}.`);
	if (validate(cachedFeeEstPerByteFull, 15)) return {
		...cachedFeeEstPerByteFull,
		...await getFeeConstants(),
	};

	const cachedFeeEstPerByteQuick = await getEstimateFeeByteQuick();
	logger.debug(`Retrieved quick estimate: ${util.inspect(cachedFeeEstPerByteQuick)}.`);
	if (validate(cachedFeeEstPerByteQuick, 5)) return {
		...cachedFeeEstPerByteQuick,
		...await getFeeConstants(),
	};

	return {
		data: { error: 'The estimates are currently under processing. Please retry in 30 seconds.' },
		status: 'SERVICE_UNAVAILABLE',
	};
};

const newBlockListener = async () => {
	try {
		if (config.feeEstimates.fullAlgorithmEnabled) {
			logger.debug('Initiate the dynamic fee estimates computation (full computation).');
			calculateEstimateFeeByteFull();
		}
		if (config.feeEstimates.quickAlgorithmEnabled) {
			logger.debug('Initiate the dynamic fee estimates computation (quick algorithm).');
			const feeEstimate = await calculateEstimateFeeByteQuick();
			logger.debug(`============== 'newFeeEstimate' signal: ${Signals.get('newFeeEstimate')} ==============.`);
			Signals.get('newFeeEstimate').dispatch(feeEstimate);
		}
	} catch (err) {
		logger.error(`Error occured when processing 'calculateFeeEstimate' event:\n${err.stack}.`);
	}
};

Signals.get('newBlock').add(newBlockListener);

module.exports = {
	getEstimateFeeByte,
	getEstimateFeeByteQuick,
	getEstimateFeeByteFull,
};
