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
