/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const CoreService = require('./core.js');
const requestAll = require('./requestAll');

const logger = Logger();

const { peerStates } = CoreService;

const peerStore = {
	peers: [],
	connected: [],
	disconnected: [],
};

const reload = async (core) => {
	logger.info('Refreshing peer cache...');
	peerStore.peers = await requestAll(core.getPeers, {});
	peerStore.connected = peerStore.peers.filter(o => o.state === peerStates.CONNECTED);
	peerStore.disconnected = peerStore.peers.filter(o => o.state === peerStates.DISCONNECTED);
	logger.info('Updated peer cache.');
};

const get = (type = 'peers') => new Promise((resolve) => {
	resolve(peerStore[type]);
});

module.exports = {
	reload,
	get,
};
