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
const actions = require('./actions');

const peerStates = {
	CONNECTED: 'connected',
	DISCONNECTED: 'disconnected',
};

const refactorPeer = (orgPeer, state) => {
	const { ipAddress, options: { height } = {}, ...peer } = orgPeer;
	peer.state = state;
	peer.height = height;
	peer.ip = ipAddress;
	return peer;
};

const getPeers = async () => {
	const connectedPeers = await actions.getConnectedPeers();
	connectedPeers.data = connectedPeers
		.map(orgPeer => refactorPeer(orgPeer, peerStates.CONNECTED));

	const disconnectedPeers = await actions.getDisconnectedPeers();
	disconnectedPeers.data = disconnectedPeers
		.map(orgPeer => refactorPeer(orgPeer, peerStates.DISCONNECTED));

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
