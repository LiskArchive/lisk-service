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
const { invokeEndpoint } = require('./client');
const { getRegisteredModules } = require('./endpoints_1');

let registeredRewardModule;
let rewardTokenID;

const MODULE = {
	DYNAMIC_REWARD: 'dynamicReward',
	REWARD: 'reward',
};

const cacheRegisteredRewardModule = async () => {
	const registeredModules = await getRegisteredModules();
	registeredRewardModule = registeredModules.find(m => Object.values(MODULE).includes(m));
	if (!registeredRewardModule) throw new Error('Unable to determine registered reward module.');
};

const getRewardTokenID = async () => {
	if (!rewardTokenID) {
		const response = await invokeEndpoint(`${registeredRewardModule}_getRewardTokenID`);
		rewardTokenID = response.tokenID;
	}
	return rewardTokenID;
};

const getAnnualInflation = async height => {
	const annualInflation = await invokeEndpoint(`${registeredRewardModule}_getAnnualInflation`, {
		height,
	});
	return annualInflation;
};

const getDefaultRewardAtHeight = async height => {
	const defaultRewardResponse = await invokeEndpoint(
		`${registeredRewardModule}_getDefaultRewardAtHeight`,
		{ height },
	);
	return defaultRewardResponse;
};

module.exports = {
	getRewardTokenID,
	getAnnualInflation,
	getDefaultRewardAtHeight,
	cacheRegisteredRewardModule,
};
