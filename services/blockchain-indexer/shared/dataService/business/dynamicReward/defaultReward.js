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

const { getRewardTokenID } = require('./constants');

const getDefaultRewardAtHeight = async (params) => {
	const response = {
		data: {},
		meta: {},
	};
	const defaultRewardResponse = await requestConnector('getDefaultRewardAtHeight', { height: params.height });
	const rewardTokenID = await getRewardTokenID();

	response.data = {
		defaultReward: defaultRewardResponse.reward,
		tokenID: rewardTokenID,
	};

	return response;
};

module.exports = {
	getDefaultRewardAtHeight,
};
