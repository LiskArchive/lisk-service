/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const coreService = require('../../shared/core');

const getPeers = async params => {
	const response = await coreService.getPeers(params);

	return {
		data: response.data,
		meta: response.meta,
	};
};

const getConnectedPeers = async params => {
	const response = await coreService.getConnectedPeers(params);

	return {
		data: response.data,
		meta: response.meta,
	};
};

const getDisconnectedPeers = async params => {
	const response = await coreService.getDisconnectedPeers(params);

	return {
		data: response.data,
		meta: response.meta,
	};
};

const getPeersStatistics = async () => {
	const response = await coreService.getPeersStatistics();

	return {
		data: response.data,
		meta: response.meta,
	};
};

module.exports = {
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
};
