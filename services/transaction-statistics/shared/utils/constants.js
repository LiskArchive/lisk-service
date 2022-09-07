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
const { requestIndexer } = require('./request');
const config = require('../../config');

let chainID;

const setChainID = async () => {
	if (!chainID) {
		const networkStatus = await requestIndexer('network.status');
		chainID = networkStatus.data.chainID;
	}
};

const getChainID = async () => chainID;

const resolveGlobalTokenID = (tokenID) => {
	if (!tokenID) return config.CONSTANT.UNAVAILABLE;

	// TODO: Remove once chainID is available from network status
	if (!chainID) return tokenID;

	const localID = tokenID.slice(8);
	const globalTokenID = `${chainID}${localID}`;
	return globalTokenID;
};

module.exports = {
	setChainID,
	getChainID,
	resolveGlobalTokenID,
};
