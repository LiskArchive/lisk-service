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
const { parseToJSONCompatObj } = require('../jsonTools');

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
	status.genesisConfig.rewards.milestones.sort((a, b) => Number(BigInt(b) - BigInt(a)));
	status.milestone = calculateMilestone(
		status.height,
		status.genesisConfig.rewards,
	);
	status.currentReward = calculateDefaultReward(
		status.height,
		status.genesisConfig.rewards,
	);
	status.moduleAssets = resolvemoduleAssets(status.registeredModules);
	status.registeredModules = status.registeredModules.map(item => item.name);

	status.lastUpdate = Math.floor(Date.now() / 1000);

	// Required to fetch knownAccounts
	status.constants = { nethash: status.networkIdentifier };

	return { data: parseToJSONCompatObj(status) };
};

module.exports = {
	getNetworkStatus,
	getGenesisConfig,
};
