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
const dataService = require('./dataService');
const regex = require('./regex');

let chainID;

const isMainchain = async () => {
	if (!chainID) {
		const networkStatus = (await dataService.getNetworkStatus()).data;
		chainID = networkStatus.chainID;
	}
	return regex.MAINCHAIN_ID.test(chainID);
};

module.exports = {
	isMainchain,
};
