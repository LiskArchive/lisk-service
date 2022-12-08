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

const getInflationRate = async () => {
	const rewardInflation = {
		data: {},
		meta: {},
	};

	// TODO: Refactor implementation once given endpoint is exposed from sdk
	// Ref: https://github.com/LiskHQ/lisk-sdk/issues/7799
	rewardInflation.data = await requestConnector('getInflationRate');
	return rewardInflation;
};

module.exports = {
	getInflationRate,
};
