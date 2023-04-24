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
const { Logger, Signals } = require('lisk-service-framework');
const { getNodeInfo } = require('./endpoints');
const peerCache = require('./peerCache');
const { parseToJSONCompatObj } = require('../utils/parser');

const logger = Logger();

let genesisConfig;
let networkStatus;

const getGenesisConfig = async () => {
	if (!genesisConfig) {
		networkStatus = await getNodeInfo();
		genesisConfig = networkStatus.genesis;
	}
	return genesisConfig;
};

const refreshNetworkStatus = async () => {
	const refreshNetworkStatusListener = async () => {
		try {
			logger.debug('Refreshing network status');
			networkStatus = await getNodeInfo();
		} catch (err) {
			logger.warn(`Error occurred while refreshing network status:\n${err.stack}`);
		}
	};

	if (!networkStatus) {
		await refreshNetworkStatusListener();
	}

	Signals.get('chainNewBlock').add(refreshNetworkStatusListener);
};

const getNetworkStatus = async () => {
	if (!networkStatus) {
		await refreshNetworkStatus();
	}
	return parseToJSONCompatObj(networkStatus);
};

const getNetworkConnectedPeers = async () => peerCache.get('connected');

const getNetworkDisconnectedPeers = async () => peerCache.get('disconnected');

const getNetworkPeers = async () => peerCache.get();

const getNetworkPeersStatistics = async () => peerCache.getStatistics();

module.exports = {
	getNetworkStatus,
	getGenesisConfig,
	refreshNetworkStatus,

	getNetworkPeers,
	getNetworkConnectedPeers,
	getNetworkDisconnectedPeers,
	getNetworkPeersStatistics,
};
