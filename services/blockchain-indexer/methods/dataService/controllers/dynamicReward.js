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

const getDefaultRewardAtHeight = async params => {
	const defaultReward = {
		data: {},
		meta: {},
	};

	const response = await dataService.getDefaultRewardAtHeight(params);
	if (response.data) defaultReward.data = response.data;
	if (response.meta) defaultReward.meta = response.meta;

	return defaultReward;
};

const getInflationRate = async () => {
	const inflationRate = {
		data: {},
		meta: {},
	};

	const response = await dataService.getInflationRate();
	if (response.data) inflationRate.data = response.data;
	if (response.meta) inflationRate.meta = response.meta;

	return inflationRate;
};

const getRewardConstants = async () => {
	const rewardConstants = {
		data: {},
		meta: {},
	};

	const response = await dataService.getRewardConstants();
	if (response.data) rewardConstants.data = response.data;
	if (response.meta) rewardConstants.meta = response.meta;

	return rewardConstants;
};

module.exports = {
	getDefaultRewardAtHeight,
	getInflationRate,
	getRewardConstants,
};

