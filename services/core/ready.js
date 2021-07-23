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
const { Logger } = require('lisk-service-framework');

const core = require('./shared/core');
const config = require('./config');
const Signals = require('./shared/signals');

const logger = Logger();

const features = {
	isIndexReady: false,
	isTransactionStatsReady: false,
	isFeeEstimatesReady: false,
	isDelegatesReady: false,
};

const isCoreReady = () => !Object.keys(features).some(value => !features[value]);

// Check if all blocks are indexed
const blockIndexReadyListener = () => {
	logger.debug('Indexing finished');
	features.isIndexReady = true;
};

Signals.get('blockIndexReady').add(blockIndexReadyListener);

// Check if transaction stats are built
const transactionStatsReadyListener = (days) => {
	logger.debug('Transaction stats calculated for:', `${days}days`);
	features.isTransactionStatsReady = true;
};
Signals.get('transactionStatsReady').add(transactionStatsReadyListener);

const newBlockListener = async () => {
	if (!isCoreReady()) {
		// Check for fee estimates
		logger.debug('Check if fee estmates are ready');
		const fees = await core.getEstimateFeeByte();
		if (Object.getOwnPropertyNames(fees).length) features.isFeeEstimatesReady = true;

		// Check if delegates list is ready
		const delegatesList = await core.getDelegates({});
		if (delegatesList.data.length) features.isDelegatesReady = true;

		// Check if transaction stats are disabled, set isTransactionStatsReady to true
		if (config.transactionStatistics.enabled === false) features.isTransactionStatsReady = true;
	}

	// Core reports readiness only if all services available
	logger.debug(`============== 'coreServiceReady' signal: ${Signals.get('coreServiceReady')} ==============`);
	if (isCoreReady()) Signals.get('coreServiceReady').dispatch(true);
};
Signals.get('newBlock').add(newBlockListener);

const getCurrentStatus = async () => features;

module.exports = {
	getCurrentStatus,
};
