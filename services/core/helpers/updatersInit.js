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
const core = require('../shared/core');
const config = require('../config');

const updaters = require('./updaters');

const recentBlocksCache = require('../shared/recentBlocksCache');
const delegateCache = require('../shared/delegateCache');
const transactionStatistics = require('../shared/transactionStatistics');

module.exports = () => {
	recentBlocksCache.init(core);
	delegateCache.init(core);

	transactionStatistics.init(config.transactionStatistics.historyLengthDays);
	setInterval(
		transactionStatistics.updateTodayStats,
		config.transactionStatistics.updateInterval * 1000);

	// Run Redis-based updaters
	updaters();
};
