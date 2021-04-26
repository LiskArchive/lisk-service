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
const signals = require('./shared/signals');

const features = {
    isIndexReady: false,
    isTransactionStatsReady: false,
};

signals.get('blockIndexReady').add(() => {
    logger.debug('Indexing finished');
    features.isIndexReady = true;
});

signals.get('transactionStatsReady').add((days) => {
    logger.debug('Transaction stats calculated for:', `${days}days`);
    features.isTransactionStatsReady = true;
});

const getCurrentStatus = () => features;

module.exports = {
    getCurrentStatus,
};
