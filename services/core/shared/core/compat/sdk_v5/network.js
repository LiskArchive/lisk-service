/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const coreApi = require('./coreApi');
const { resolvemoduleAssets } = require('../common/constants');

const requestApi = coreApi.requestRetry;

const getNetworkStatus = async () => {
	const status = await requestApi(coreApi.getNetworkStatus);

	const { offset, distance, milestones } = status.data.genesisConfig.rewards;
	const rewardIndex = Math.floor((status.data.height - offset) / distance);
	const finalRewardIndex = rewardIndex >= milestones.length
		? milestones.length - 1
		: rewardIndex;
	status.data.currentReward = finalRewardIndex >= 0
		? milestones[finalRewardIndex]
		: 0;
	status.data.milestone = status.data.currentReward;

	status.data.moduleAssets = await resolvemoduleAssets(status.data.registeredModules);
	status.data.registeredModules = status.data.registeredModules.map(item => item.name);

	status.data.lastUpdate = Math.floor(Date.now() / 1000);

	// Required to fetch knownAccounts
	status.data.constants = { nethash: status.data.networkIdentifier };

	return status;
};

module.exports = {
	getNetworkStatus,
};
