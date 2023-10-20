/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const { Signals } = require('lisk-service-framework');
const { requestConnector } = require('./utils/request');

let genesisHeight;
let currentHeight;

const getGenesisHeight = async () => {
	if (typeof genesisHeight !== 'number') {
		genesisHeight = await requestConnector('getGenesisHeight');
	}
	return genesisHeight;
};

const getCurrentHeight = async () => {
	if (typeof currentHeight !== 'number') {
		const networkStatus = await requestConnector('getNetworkStatus');
		currentHeight = networkStatus.height;
	}
	return currentHeight;
};

const initNodeConstants = async () => {
	const nodeInfoListener = async payload => {
		// Caching all node constants
		genesisHeight = payload.genesisHeight;
		currentHeight = payload.height;
	};
	Signals.get('nodeInfo').add(nodeInfoListener);
};

module.exports = {
	getGenesisHeight,
	getCurrentHeight,
	initNodeConstants,
};
