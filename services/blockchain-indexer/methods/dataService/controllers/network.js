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
	const response = await dataService.getNetworkPeersStatistics();
	if (response.data) networkStats.data = response.data;
	if (response.meta) networkStats.meta = response.meta;

	networkStats.data.totalLocked = await getTotalLocked();
	networkStats.data.totalStaked = await getTotalStaked();
	networkStats.data.totalSelfStaked = await getTotalSelfStaked();

	return networkStats;
};

const getNetworkPeers = async params => {
	const peers = {
		data: [],
		meta: {},
	};
	const response = await dataService.getNetworkPeers(params);
	if (response.data) peers.data = response.data;
	if (response.meta) peers.meta = response.meta;

	return peers;
};

const getNetworkConnectedPeers = async params => {
	const connectedPeers = {
		data: [],
		meta: {},
	};
	const response = await dataService.getNetworkConnectedPeers(params);
	if (response.data) connectedPeers.data = response.data;
	if (response.meta) connectedPeers.meta = response.meta;

	return connectedPeers;
};

const getNetworkDisconnectedPeers = async params => {
	const disconnectedPeers = {
		data: [],
		meta: {},
	};
	const response = await dataService.getNetworkDisconnectedPeers(params);
	if (response.data) disconnectedPeers.data = response.data;
	if (response.meta) disconnectedPeers.meta = response.meta;

	return disconnectedPeers;
};

const getNetworkPeersStatistics = async () => {
	const peerStatistics = {
		data: {},
		meta: {},
	};
	const response = await dataService.getNetworkPeersStatistics();
	if (response.data) peerStatistics.data = response.data;
	if (response.meta) peerStatistics.meta = response.meta;

	return peerStatistics;
};

module.exports = {
	getNetworkStatus,
	getNetworkStatistics,

	getNetworkPeers,
	getNetworkConnectedPeers,
	getNetworkDisconnectedPeers,
	getNetworkPeersStatistics,
};
