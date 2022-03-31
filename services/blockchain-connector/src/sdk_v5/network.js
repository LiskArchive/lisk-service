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
const { getNodeInfo } = require('./actions');
const { parseToJSONCompatObj } = require('../utils/jsonTools');

let genesisConfig;

const getGenesisConfig = async () => {
	if (!genesisConfig) {
		const networkStatus = await getNodeInfo();
		genesisConfig = networkStatus.data.genesisConfig;
	}
	return genesisConfig;
};

const resolvemoduleAssets = (data) => {
	let result = [];
	data.forEach(liskModule => {
		if (liskModule.transactionAssets.length) {
			result = result.concat(
				liskModule.transactionAssets.map(asset => {
					const id = String(liskModule.id).concat(':').concat(asset.id);
					if (liskModule.name && asset.name) {
						const name = liskModule.name.concat(':').concat(asset.name);
						return { id, name };
					}
					return { id };
				}),
			);
		}
	});
	return result;
};

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
	const status = await getNodeInfo();

	// Ensure 'milestones' are in correct order
	status.data.genesisConfig.rewards.milestones.sort((a, b) => Number(BigInt(b) - BigInt(a)));
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
	getGenesisConfig,
};
