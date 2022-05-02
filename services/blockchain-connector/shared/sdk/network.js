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
const { getNodeInfo } = require('./endpoints');
const { parseToJSONCompatObj } = require('../parser');

let genesisConfig;

const getGenesisConfig = async () => {
	if (!genesisConfig) {
		const networkStatus = await getNodeInfo();
		genesisConfig = networkStatus.data.genesis;
	}
	return genesisConfig;
};

const getNetworkStatus = async () => {
	const status = await getNodeInfo();
	status.lastUpdate = Math.floor(Date.now() / 1000);
	// Required to fetch knownAccounts
	status.constants = { nethash: status.networkIdentifier };
	return { data: parseToJSONCompatObj(status) };
};

module.exports = {
	getNetworkStatus,
	getGenesisConfig,
};
