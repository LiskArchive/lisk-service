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
// TODO: Enable when available from SDK
// const dataService = require('../../../shared/dataService');

const getBlockchainAppsStatistics = async () => {
	// const result = await dataService.getBlockchainAppsStatistics();

	const result = {
		data: {
			registered: 2503,
			active: 2328,
			terminated: 35,
			totalSupplyLSK: 5000000,
			stakedLSK: 3000000,
			inflationRate: 4.5,
		},
	};

	return result;
};

const getBlockchainApps = async (params) => {
	// const result = await dataService.getBlockchainApps(params);

	const result = {
		data: [{
			name: 'Test app',
			chainID: 'aq02qkbb35u4jdq8szo3pnsq',
			state: 'active',
			address: 'lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu',
			lastCertificateHeight: '1000',
			lastUpdated: 123456789,
		}],
		meta: {
			count: 10,
			offset: params.offset,
			total: 150,
		},
	};

	return result;
};

module.exports = {
	getBlockchainAppsStatistics,
	getBlockchainApps,
};
