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
} = require('lisk-service-framework');

const {
	getEstimateFeeByteForBlock,
} = require('./dynamicFeesLIP');
const { requestConnector } = require('./request');

const config = require('../../config');

const executionStatus = {
	// false: not running, true: running
	[config.cacheKeys.cacheKeyFeeEstFull]: false,
	[config.cacheKeys.cacheKeyFeeEstQuick]: false,
};

const cacheRedisFees = CacheRedis('fees', config.endpoints.cache);
const logger = Logger();

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
			// If the process (full / quick) is already running,
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

const isFeeCalculationRunning = (cacheKey) => executionStatus[cacheKey];

module.exports = {
	checkAndProcessExecution,
	getEstimateFeeByteForBatch,
	isFeeCalculationRunning,
};
