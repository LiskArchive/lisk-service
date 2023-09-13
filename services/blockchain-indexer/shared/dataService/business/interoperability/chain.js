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
const { getNetworkStatus } = require('../network');
const regex = require('../../../regex');

let chainID;

const getCurrentChainID = async () => {
	if (!chainID) {
		const networkStatus = await getNetworkStatus();
		if (networkStatus.data && networkStatus.data.chainID) {
			chainID = networkStatus.data.chainID;
		}
	}
	return chainID;
};

const isMainchain = async () => regex.MAINCHAIN_ID.test(await getCurrentChainID());

module.exports = {
	isMainchain,

	// For unit testing
	getCurrentChainID,
};
