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
const { getNetworkStatus } = require('./network');
const regex = require('../../regex');
const config = require('../../../config');
const { LENGTH_CHAIN_ID, LENGTH_NETWORK_ID } = require('../../constants');

let chainID;

const isMainchain = async () => {
	if (!chainID) {
		const networkStatus = (await getNetworkStatus()).data;
		chainID = networkStatus.chainID;
	}
	return regex.MAINCHAIN_ID.test(chainID);
};

const resolveMainchainServiceURL = async () => {
	if (config.endpoints.mainchainServiceUrl) return config.endpoints.mainchainServiceUrl;

	if (!chainID) {
		const networkStatus = (await getNetworkStatus()).data;
		chainID = networkStatus.chainID;
	}

	const networkID = chainID.substring(0, LENGTH_NETWORK_ID);
	const mainchainID = networkID.padEnd(LENGTH_CHAIN_ID, '0');
	const [{ serviceURL } = {}] = config.networks.LISK
		.filter(networkInfo => networkInfo.chainID === mainchainID);
	return serviceURL;
};

module.exports = {
	isMainchain,
	resolveMainchainServiceURL,
};
