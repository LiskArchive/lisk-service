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
const { parseToJSONCompatObj } = require('../../../jsonTools');

const requestApi = coreApi.requestRetry;

// As in https://github.com/LiskHQ/lisk-sdk/blob/v5.1.4/elements/lisk-chain/src/block_reward.ts
const calculateMilestone = (height, blockRewardArgs) => {
	const distance = Math.floor(blockRewardArgs.distance);
	const location = Math.trunc((height - blockRewardArgs.offset) / distance);
	const lastMile = blockRewardArgs.milestones[blockRewardArgs.milestones.length - 1];

	if (location > blockRewardArgs.milestones.length - 1) {
		return blockRewardArgs.milestones.lastIndexOf(lastMile);
	}

	return location;
};

const calculateDefaultReward = (height, blockRewardArgs) => {
	if (height < blockRewardArgs.offset) {
		return BigInt(0);
	}

	return blockRewardArgs.milestones[calculateMilestone(height, blockRewardArgs)];
};

const getNetworkStatus = async () => {
	const status = await requestApi(coreApi.getNetworkStatus);

	status.data.milestone = calculateMilestone(
		status.data.height,
		status.data.genesisConfig.rewards,
	);
	status.data.currentReward = calculateDefaultReward(
		status.data.height,
		status.data.genesisConfig.rewards,
	);
	status.data.moduleAssets = resolvemoduleAssets(status.data.registeredModules);
	status.data.registeredModules = status.data.registeredModules.map(item => item.name);

	status.data.lastUpdate = Math.floor(Date.now() / 1000);

	// Required to fetch knownAccounts
	status.data.constants = { nethash: status.data.networkIdentifier };

	return parseToJSONCompatObj(status);
};

module.exports = {
	getNetworkStatus,
};
