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

let chainID;

const DB_CONSTANT = {
	ANY: 'any',
	UNAVAILABLE: 'na',
};

const DATE_FORMAT = {
	DAY: 'YYYY-MM-DD',
	MONTH: 'YYYY-MM',
};

const getChainID = async () => {
	if (typeof chainID === 'undefined') {
		const networkStatus = await requestIndexer('network.status');
		chainID = networkStatus.data.chainID;
	}

	return chainID;
};

const resolveGlobalTokenID = (tokenID) => {
	if (!tokenID) return DB_CONSTANT.UNAVAILABLE;

	// TODO: Remove once chainID is available from network status
	if (!chainID) return tokenID;

	const localID = tokenID.slice(8);
	const globalTokenID = `${chainID}${localID}`;
	return globalTokenID;
};

module.exports = {
	getChainID,
	resolveGlobalTokenID,

	DB_CONSTANT,
	DATE_FORMAT,
};
