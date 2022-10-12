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
const { HTTP } = require('lisk-service-framework');
const dataService = require('../../../shared/dataService');
const config = require('../../../config');
const regex = require('../../../shared/utils/regex');

const isMainchain = async () => {
	const { chainID } = (await dataService.getNetworkStatus()).data;
	return chainID.match(regex.MAINCHAIN);
};

const resolveMainchainServiceURL = async () => {
	const { chainID } = await dataService.getNetworkStatus();
	const { serviceURL } = config.networks
		.find(networkInfo => networkInfo.chainID === chainID);
	return serviceURL;
};

const getBlockchainApps = async (params) => {
	if (await isMainchain()) {
		const result = await dataService.getBlockchainApps(params);
		return result;
	}
	// Redirect call to the mainchain service
	const serviceURL = await resolveMainchainServiceURL();
	const blockchainAppsEndpoint = `${serviceURL}/api/v3/blockchain/apps`;
	const response = HTTP.request(
		blockchainAppsEndpoint,
		params,
	);
	return response;
};

const getBlockchainAppsStatistics = async () => {
	if (await isMainchain()) {
		const result = await dataService.getBlockchainAppsStatistics();
		return result;
	}
	// Redirect call to the mainchain service
	const serviceURL = await resolveMainchainServiceURL();
	const blockchainAppsStatsEndpoint = `${serviceURL}/api/v3/blockchain/apps/statistics`;
	const response = HTTP.get(blockchainAppsStatsEndpoint);
	return response;
};

module.exports = {
	getBlockchainApps,
	getBlockchainAppsStatistics,
};
