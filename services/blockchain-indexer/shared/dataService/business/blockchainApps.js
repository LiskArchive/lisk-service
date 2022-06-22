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

const config = require('../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const blockchainAppsIndexSchema = require('../../database/schema/blockchainApps');

const getBlockchainAppsIndex = () => getTableInstance('blockchain_apps', blockchainAppsIndexSchema, MYSQL_ENDPOINT);

const getBlockchainAppsStatistics = async () => {
	const blockchainAppsDB = await getBlockchainAppsIndex();

	const activeChain = await blockchainAppsDB.count({ state: 'active' });
	const registeredChain = await blockchainAppsDB.count({ state: 'registered' });
	const terminatedChain = await blockchainAppsDB.count({ state: 'terminated' });

	const response = {
		registered: registeredChain,
		active: activeChain,
		terminated: terminatedChain,
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

const getBlockchainApps = async (params) => {
	// TODO: Replace it with the real implementation with the issue https://github.com/LiskHQ/lisk-service/issues/1111
	const response = [{
		name: 'test',
		chainID: '2ba563cf98003d',
		state: 'active',
		address: 'lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu',
		lastCertificateHeight: '20',
		lastUpdated: '1651756153',

	}];

	return {
		data: response,
		meta: {
			count: 1,
			offset: params.offset,
			total: 150,

		},
	};
};

module.exports = {
	getBlockchainAppsStatistics,
	getBlockchainApps,
};
