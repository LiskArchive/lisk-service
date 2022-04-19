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
const { Logger } = require('lisk-service-framework');
const actions = require('./actions');
const Signals = require('../signals');

const logger = Logger();

const peerStates = {
	CONNECTED: 'connected',
	DISCONNECTED: 'disconnected',
};

const peerStore = {
	peers: [],
	connected: [],
	disconnected: [],
	statistics: {
		basic: {},
		coreVer: {},
		height: {},
		os: {},
	},
};

const get = (type = 'peers') => new Promise((resolve) => {
	resolve(peerStore[type]);
});

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
	return data;
};

const refreshStatistics = async () => {
	const basicStats = {};
	const heightStats = {};
	const coreVerStats = {};
	const networkVerStats = {};
	const osStats = {};

	const peers = await get();
	const connected = await get('connected');
	const disconnected = await get('disconnected');

	basicStats.totalPeers = peers.length;
	basicStats.connectedPeers = connected.length;
	basicStats.disconnectedPeers = disconnected.length;

	const heightArr = connected.map(elem => elem.height);
	heightArr.forEach(elem => { if (elem) heightStats[elem] = (heightStats[elem] || 0) + 1; });

	const coreVerArr = connected.map(elem => elem.version);
	coreVerArr.forEach(elem => { if (elem) coreVerStats[elem] = (coreVerStats[elem] || 0) + 1; });

	const networkVerArr = connected.map(elem => elem.networkVersion);
	networkVerArr
		.forEach(elem => { if (elem) networkVerStats[elem] = (networkVerStats[elem] || 0) + 1; });

	const osArr = connected.map(elem => elem.os);
	const mappedOs = osArr.map((elem) => {
		if (typeof elem === 'string' && elem.match(/^linux(.*)/)) {
			const splitOsString = elem.split('.');
			elem = `${splitOsString[0]}.${splitOsString[1].split('-')[0]}`;
		}
		return elem;
	});
	mappedOs.forEach(elem => { if (elem) osStats[elem] = (osStats[elem] || 0) + 1; });

	return {
		basic: basicStats,
		height: heightStats,
		coreVer: coreVerStats,
		networkVersion: networkVerStats,
		os: osStats,
	};
};

const getStatistics = () => peerStore.statistics;

const reload = async () => {
	logger.debug('Refreshing peer cache...');
	try {
		peerStore.peers = await getPeers();
		peerStore.connected = peerStore.peers.filter(o => o.state === peerStates.CONNECTED);
		peerStore.disconnected = peerStore.peers.filter(o => o.state === peerStates.DISCONNECTED);
		peerStore.statistics = await refreshStatistics();
		logger.debug('Updated peer cache.');
		logger.debug(`============== 'peerReload' signal: ${Signals.get('peerReload')} ==============`);
		Signals.get('peerReload').dispatch(peerStore.peers);
	} catch (err) {
		logger.debug(`Unable to reload peer cache: ${err.message}`);
	}
};

module.exports = {
	reload,
	refreshStatistics,
	get,
	getStatistics,
};
