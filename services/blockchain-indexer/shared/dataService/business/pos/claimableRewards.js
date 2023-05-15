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
const {
	getLisk32AddressFromPublicKey,
	updateAccountPublicKey,
} = require('../../../indexer/utils/account');
const { requestConnector } = require('../../../utils/request');
const { getAddressByName } = require('../../../indexer/utils/validator');

const getPosClaimableRewards = async params => {
	const claimableRewards = {
		data: [],
		meta: {},
	};

	if (!params.address && params.name) {
		params.address = await getAddressByName(params.name);
	}

	if (!params.address && params.publicKey) {
		params.address = getLisk32AddressFromPublicKey(params.publicKey);

		// Index publicKey
		updateAccountPublicKey(params.publicKey);
	}

	if (!params.address) {
		return claimableRewards;
	}

	const response = await requestConnector('getPosClaimableRewards', { address: params.address });
	claimableRewards.data = response.rewards.slice(params.offset, params.offset + params.limit);

	claimableRewards.meta = {
		count: claimableRewards.data.length,
		offset: params.offset,
		total: response.rewards.length,
	};

	return claimableRewards;
};

module.exports = {
	getPosClaimableRewards,
};
