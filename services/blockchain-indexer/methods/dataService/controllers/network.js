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

const {
	getTotalStaked,
	getTotalSelfStaked,
} = require('../../../shared/utils/pos');
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
	const networkStats = {
		data: {},
		meta: {},
	};
	const response = await dataService.getPeersStatistics();
	if (response.data) networkStats.data = response.data;
	if (response.meta) networkStats.meta = response.meta;

	networkStats.data.totalLocked = await getTotalLocked();
	networkStats.data.totalStaked = await getTotalStaked();
	networkStats.data.totalSelfStaked = await getTotalSelfStaked();

	return networkStats;
};

module.exports = {
	getNetworkStatus,
	getNetworkStatistics,
};
