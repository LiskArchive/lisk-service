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
const { requestConnector } = require('../../../utils/request');

const getRewardsLocked = async params => {
	// Params must contain either address or name or publicKey
	if (!Object.keys(params).some(param => ['address', 'name', 'publicKey'].includes(param))) {
		throw new Error('One of params (address, name or publicKey) is required.');
	}

	const tokenID = '0400000000000000';
	const { address } = params;

	const { reward } = await requestConnector('getLockedRewards', { tokenID, address });

	return reward;
};

module.exports = {
	getRewardsLocked,
};
