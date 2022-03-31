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
const peerInfo = require('../../src/sdk_v5/peers');

const getPeers = async params => {
	const response = await peerInfo.getPeers(params);

	return {
		data: response.data,
		meta: response.meta,
	};
};

const getConnectedPeers = async params => {
	const response = await peerInfo.getConnectedPeers(params);

	return {
		data: response.data,
		meta: response.meta,
	};
};

const getDisconnectedPeers = async params => {
	const response = await peerInfo.getDisconnectedPeers(params);

	return {
		data: response.data,
		meta: response.meta,
	};
};

const getPeersStatistics = async () => {
	const response = await peerInfo.getPeersStatistics();

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
