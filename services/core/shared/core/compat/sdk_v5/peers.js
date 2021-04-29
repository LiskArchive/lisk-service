/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const coreApi = require('./coreApi');

const peerStates = {
	CONNECTED: 'connected',
	DISCONNECTED: 'disconnected',
};

const getPeers = async () => {
	const connectedPeers = await coreApi.getPeers(peerStates.CONNECTED);
	connectedPeers.data = connectedPeers.data.map(orgPeer => {
		const { ipAddress, options: { height }, ...peer } = orgPeer;

		peer.state = peerStates.CONNECTED;
		peer.height = height;
		peer.ip = ipAddress;
		return peer;
	});

	const disconnectedPeers = await coreApi.getPeers(peerStates.DISCONNECTED);
	disconnectedPeers.data.forEach(peer => {
		peer.state = peerStates.DISCONNECTED;
		peer.ip = peer.ipAddress;
		if (peer.options) peer.height = peer.options.height;
		return peer;
	});

	const data = [
		...connectedPeers.data,
		...disconnectedPeers.data,
	];

	const meta = { count: data.length };

	return { data, meta };
};

module.exports = {
	peerStates,
	getPeers,
};
