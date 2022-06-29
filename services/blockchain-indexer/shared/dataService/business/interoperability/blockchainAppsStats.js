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
const { MySQL: { getTableInstance } } = require('lisk-service-framework');

const { APP_STATE } = require('./constants');
const config = require('../../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const blockchainAppsIndexSchema = require('../../../database/schema/blockchainApps');

const getBlockchainAppsIndex = () => getTableInstance('blockchain_apps', blockchainAppsIndexSchema, MYSQL_ENDPOINT);

const getBlockchainAppsStatistics = async () => {
	const blockchainAppsDB = await getBlockchainAppsIndex();

	const numActiveChains = await blockchainAppsDB.count({ state: APP_STATE.ACTIVE });
	const numRegisteredChains = await blockchainAppsDB.count({ state: APP_STATE.REGISTERED });
	const numTerminatedChains = await blockchainAppsDB.count({ state: APP_STATE.TERMINATED });

	const response = {
		registered: numRegisteredChains,
		active: numActiveChains,
		terminated: numTerminatedChains,
		// TODO: Get these information directly from SDK once issue https://github.com/LiskHQ/lisk-sdk/issues/7225 is closed
		totalSupplyLSK: '',
		stakedLSK: '',
		inflationRate: '',
	};

	return {
		data: response,
		meta: {},
	};
};

module.exports = {
	getBlockchainAppsStatistics,
};
