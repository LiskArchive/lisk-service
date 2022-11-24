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
	getNetworkFeeConstants,
} = require('./networkConstants');

const {
	checkAndProcessExecution,
	isFeeCalculationRunning,
} = require('./utils/dynamicFees');

const cacheRedisFees = CacheRedis('fees', config.endpoints.cache);

const logger = Logger();

const calculateEstimateFeeByteNormal = async () => {
	const { header: latestBlock } = await requestConnector('getLastBlock');
	const fromHeight = config.feeEstimates.defaultStartBlockHeight;
	const toHeight = latestBlock.height;

	if (!isFeeCalculationRunning(config.cacheKeys.cacheKeyFeeEstNormal)) {
		logger.debug(`Computing normal fee estimate for block ${latestBlock.id} at height ${latestBlock.height}`);
	} else {
		logger.debug('Compute normal fee estimate is already running. Won\'t start again until the current execution finishes');
	}
	const cachedFeeEstPerByteNormal = await checkAndProcessExecution(
		fromHeight, toHeight, config.cacheKeys.cacheKeyFeeEstNormal,
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
		fromHeight, toHeight, config.cacheKeys.cacheKeyFeeEstQuick,
	);

	return cachedFeeEstPerByteQuick;
};

const getEstimateFeeByteQuick = () => cacheRedisFees.get(config.cacheKeys.cacheKeyFeeEstNormal);
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
};
