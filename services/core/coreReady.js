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
const logger = require('lisk-service-framework').Logger();

const core = require('./shared/core');
const signals = require('./shared/signals');

const features = {
    isIndexReady: false,
    isTransactionStatsReady: false,
    isFeeEstimatesReady: false,
    isDelegatesReady: false,
};

const isCoreReady = () => !Object.keys(features).some(value => !features[value]);

// Check if all blocks are indexed
signals.get('blockIndexReady').add(() => {
    logger.debug('Indexing finished');
    features.isIndexReady = true;
});

// Check if transaction stats are built
signals.get('transactionStatsReady').add((days) => {
    logger.debug('Transaction stats calculated for:', `${days}days`);
    features.isTransactionStatsReady = true;
});

signals.get('newBlock').add(async () => {
    if (!isCoreReady()) {
        // Check for fee estimates
        logger.debug('Check if fee estmates are ready');
        const fees = await core.getEstimateFeeByte();
        if (Object.getOwnPropertyNames(fees).length) features.isFeeEstimatesReady = true;

        // Check if delegates list is ready
        const delegatesList = await core.getDelegates({});
        if (delegatesList.data.length) features.isDelegatesReady = true;

        // Core reports readiness only if all services available
        if (isCoreReady()) signals.get('coreServiceReady').dispatch(features);
    }
});

const getCurrentStatus = () => features;

module.exports = {
    getCurrentStatus,
};
