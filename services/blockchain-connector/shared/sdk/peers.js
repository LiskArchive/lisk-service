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
const peerCache = require('./peerCache');
const GeoService = require('../geolocation');

const addLocation = async (ipaddress) => {
	try {
		const result = await GeoService.requestData(ipaddress);
		return result;
	} catch (e) {
		return {};
	}
};

const getConnectedPeers = async () => {
	const peers = await peerCache.get('connected');
	const peersWithLocation = await Promise.all(peers.map(
		async peer => {
			peer.location = await addLocation(peer.ip);
			return peer;
		},
	));
	return peersWithLocation;
};

const getDisconnectedPeers = async () => {
	const peers = await peerCache.get('disconnected');
	const peersWithLocation = await Promise.all(peers.map(
		async peer => {
			peer.location = await addLocation(peer.ip);
			return peer;
		},
	));
	return peersWithLocation;
};

const getPeers = async () => [...(await getConnectedPeers()), ...(await getDisconnectedPeers())];

const getPeersStatistics = async () => peerCache.getStatistics();

module.exports = {
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
};
