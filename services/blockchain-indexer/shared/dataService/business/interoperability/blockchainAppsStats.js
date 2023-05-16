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
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const logger = Logger();

const { APP_STATUS } = require('./constants');
const config = require('../../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const blockchainAppsTableSchema = require('../../../database/schema/blockchainApps');
const { requestConnector } = require('../../../utils/request');
const { getAnnualInflation } = require('../dynamicReward');
const { getNetworkStatus } = require('../network');
const { getTotalStaked } = require('../../../utils/pos');

const getBlockchainAppsTable = () => getTableInstance(
	blockchainAppsTableSchema,
	MYSQL_ENDPOINT,
);

let blockchainAppsStatsCache = {};

const getBlockchainAppsStatistics = async () => {
	const blockchainAppsStats = {
		data: {},
		meta: {},
	};

	blockchainAppsStats.data = blockchainAppsStatsCache;
	return blockchainAppsStats;
};

const reloadBlockchainAppsStats = async () => {
	try {
		// TODO: Update implementation once interoperability_getOwnChainAccount is available
		const blockchainAppsTable = await getBlockchainAppsTable();

		const numActiveChains = await blockchainAppsTable.count({ status: APP_STATUS.ACTIVE });
		const numRegisteredChains = await blockchainAppsTable.count({ status: APP_STATUS.REGISTERED });
		const numTerminatedChains = await blockchainAppsTable.count({ status: APP_STATUS.TERMINATED });

		const { totalSupply: [{ totalSupply }] } = await requestConnector('getTotalSupply');
		const { data: { height } } = await getNetworkStatus();
		const { data: { rate: annualInflation } } = await getAnnualInflation({ height });
		const { amount: totalStaked } = await getTotalStaked();

		logger.debug('Updating blockchain apps statistics cache');

		blockchainAppsStatsCache = {
			registered: numRegisteredChains,
			active: numActiveChains,
			terminated: numTerminatedChains,
			totalSupplyLSK: totalSupply,
			totalStakedLSK: totalStaked,
			currentAnnualInflationRate: annualInflation,
		};

		logger.info('Updated blockchain apps statistics cache.');
	} catch (err) {
		logger.warn(`Failed to update blockchain apps statistics cache due to: ${err.message}`);
	}
};

module.exports = {
	getBlockchainAppsStatistics,
	reloadBlockchainAppsStats,
};
