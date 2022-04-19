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
const dataService = require('../../shared/dataService');

const getPeers = async params => {
	const response = await dataService.getPeers(params);

	return {
		data: response.data,
		meta: response.meta,
	};
};

const getConnectedPeers = async params => {
	const response = await dataService.getConnectedPeers(params);

	return {
		data: response.data,
		meta: response.meta,
	};
};

const getDisconnectedPeers = async params => {
	const response = await dataService.getDisconnectedPeers(params);

	return {
		data: response.data,
		meta: response.meta,
	};
};

const getPeersStatistics = async () => {
	const response = await dataService.getPeersStatistics();

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
