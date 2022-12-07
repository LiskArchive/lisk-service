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
const dataService = require('../../../shared/dataService');

const getInflationRate = async () => {
	const InflationReward = {
		data: {},
		meta: {},
	};

	const response = await dataService.getInflationRate();
	if (response.data) InflationReward.data = response.data;
	if (response.meta) InflationReward.meta = response.meta;

	return InflationReward;
};

module.exports = {
	getInflationRate,
};
