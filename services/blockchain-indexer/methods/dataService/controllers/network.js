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
const dataService = require('../../../shared/dataService');

const { getTotalStaked } = require('../../../shared/utils/pos');
const { getTotalLocked } = require('../../../shared/utils/token');

const getNetworkStatus = async () => {
	const networkStatus = {
		data: {},
		meta: {},
	};
	const response = await dataService.getNetworkStatus();

	if (response.data) networkStatus.data = response.data;
	if (response.meta) networkStatus.meta = response.meta;

	return networkStatus;
};

const getNetworkStatistics = async () => {
	const peerStatistics = {
		data: {},
		meta: {},
	};
	const response = await dataService.getPeersStatistics();
	if (response.data) peerStatistics.data = response.data;
	if (response.meta) peerStatistics.meta = response.meta;

	peerStatistics.data.totalLocked = await getTotalLocked();
	peerStatistics.data.totalStaked = await getTotalStaked();

	return peerStatistics;
};

module.exports = {
	getNetworkStatus,
	getNetworkStatistics,
};
