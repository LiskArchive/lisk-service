/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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

const config = require('../config');

const {
	getTokenConstants,
	getRewardConstants,
	getPosConstants,
	initFeeEstimates,
} = require('./dataService');
const { getFeeEstimatesFromFeeEstimator } = require('./dataService/business/feeEstimates');
const { initBlockProcessingQueues } = require('./indexer/blockchainIndex');
const indexStatus = require('./indexer/indexStatus');
const messageProcessor = require('./messageProcessor');

const logger = Logger();
const snapshotUtils = require('./utils/snapshot');

const init = async () => {
	try {
		// Update the constants cache
		await getPosConstants();
		await getTokenConstants();
		await getRewardConstants();

		await initFeeEstimates();

		if (config.snapshot.enable) {
			logger.info('Initializing the automatic index snapshot application process.');

			try {
				await snapshotUtils.initSnapshot();
				logger.info('Successfully downloaded and applied the snapshot.');
			} catch (err) {
				logger.warn(`Unable to apply snapshot:\n${err.message}`);
			}
		}

		// Init index status updates
		await indexStatus.init();

		// Set priority fee estimates
		await getFeeEstimatesFromFeeEstimator();

		if (config.operations.isIndexingModeEnabled) {
			await initBlockProcessingQueues();
			await messageProcessor.init();
		}
	} catch (err) {
		logger.error(`Unable to initialize due to: ${err.message}. Try restarting the application.`);
		logger.trace(err.stack);
		throw err;
	}
};

module.exports = {
	init,
};
