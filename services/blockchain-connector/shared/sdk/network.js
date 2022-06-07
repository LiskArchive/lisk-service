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
const { parseToJSONCompatObj } = require('../parser');

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

const getNetworkStatus = async () => parseToJSONCompatObj(networkStatus);

const init = async () => {
	const refreshNetworkStatusListener = async () => {
		try {
			logger.debug('Refreshing network status');
			networkStatus = await getNodeInfo();
		} catch (err) {
			logger.warn(`Error occurred while refreshing network status:\n${err.stack}`);
		}
	};
	Signals.get('appNewBlock').add(refreshNetworkStatusListener);
};

module.exports = {
	getNetworkStatus,
	getGenesisConfig,
	init,
};
