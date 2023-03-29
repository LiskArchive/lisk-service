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

const getPeers = async params => {
	const peers = {
		data: [],
		meta: {},
	};
	const response = await dataService.getPeers(params);
	if (response.data) peers.data = response.data;
	if (response.meta) peers.meta = response.meta;

	return peers;
};

const getConnectedPeers = async params => {
	const connectedPeers = {
		data: [],
		meta: {},
	};
	const response = await dataService.getConnectedPeers(params);
	if (response.data) connectedPeers.data = response.data;
	if (response.meta) connectedPeers.meta = response.meta;

	return connectedPeers;
};

const getDisconnectedPeers = async params => {
	const disconnectedPeers = {
		data: [],
		meta: {},
	};
	const response = await dataService.getDisconnectedPeers(params);
	if (response.data) disconnectedPeers.data = response.data;
	if (response.meta) disconnectedPeers.meta = response.meta;

	return disconnectedPeers;
};

const getPeersStatistics = async () => {
	const peerStatistics = {
		data: {},
		meta: {},
	};
	const response = await dataService.getPeersStatistics();
	if (response.data) peerStatistics.data = response.data;
	if (response.meta) peerStatistics.meta = response.meta;

	return peerStatistics;
};

module.exports = {
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
};
