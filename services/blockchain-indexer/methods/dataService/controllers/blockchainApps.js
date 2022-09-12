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
// const { HTTP } = require('lisk-service-framework');
// const dataService = require('../../../shared/dataService');

// const isMainchain = async () => {
// 	// TODO: Implement logic
// };

// const resolveServiceURL = async () => {
// 	// TODO: Implement logic
// }

const getBlockchainApps = async (params) => {
	// if (await isMainchain()) {
	// 	const result = await dataService.getBlockchainApps(params);
	// } else {
	// 	// Redirect call to the mainchain service
	// 	const serviceURL = await resolveServiceURL();
	// 	const blockchainAppsEndpoint = `${serviceURL}/api/v3/blockchain/apps`
	// 	const response = HTTP.request(
	// 		blockchainAppsEndpoint,
	// 		params,
	// 	)
	// 	return response;
	// }

	const result = {
		data: [
			{
				chainName: 'Lisk',
				chainID: 1,
				state: 'active',
				address: 'lsk123bhithjdq8szo3poyqe5dsxwrnazyqnzqhsy',
				isDefault: true,
				lastCertificateHeight: 900,
				lastUpdated: 123456789,
			},
			{
				chainName: 'Test app',
				chainID: 120,
				state: 'active',
				address: 'lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu',
				isDefault: false,
				lastCertificateHeight: 1000,
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

const getBlockchainAppsStatistics = async () => {
	// if (await isMainchain()) {
	// 	 const result = await dataService.getBlockchainAppsStatistics();
	// } else {
	// 	// Redirect call to the mainchain service
	// 	const serviceURL = await resolveServiceURL();
	// 	const blockchainAppsStatsEndpoint = `${serviceURL}/api/v3/blockchain/apps/statistics`
	// 	const response = HTTP.get(blockchainAppsStatsEndpoint);
	// 	return response;
	// }

	const result = {
		data: {
			registered: 2503,
			active: 2328,
			terminated: 35,
			totalSupplyLSK: '5000000',
			stakedLSK: '3000000',
			inflationRate: '4.50',
		},
	};

	return result;
};

module.exports = {
	getBlockchainApps,
	getBlockchainAppsStatistics,
};
