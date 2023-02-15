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
	Logger,
	Exceptions: { TimeoutException },
} = require('lisk-service-framework');

const { timeoutMessage, invokeEndpoint } = require('./client');
const { getRegisteredModules } = require('./endpoints_1');

const logger = Logger();

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
	try {
		if (!rewardTokenID) {
			const response = await invokeEndpoint(`${registeredRewardModule}_getRewardTokenID`);
			rewardTokenID = response.tokenID;
		}
		return rewardTokenID;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getRewardTokenID\'.');
		}
		logger.warn(`Error returned when invoking '${registeredRewardModule}_getRewardTokenID'.\n${err.stack}`);
		throw err;
	}
};

const getAnnualInflation = async (height) => {
	try {
		const annualInflation = await invokeEndpoint(`${registeredRewardModule}_getAnnualInflation`, { height });
		return annualInflation;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getAnnualInflation' with block height:${height}.`);
		}
		logger.warn(`Error returned when invoking '${registeredRewardModule}_getAnnualInflation' with block height:${height}.\n${err.stack}`);
		throw err;
	}
};

const getDefaultRewardAtHeight = async height => {
	try {
		const defaultRewardResponse = await invokeEndpoint(`${registeredRewardModule}_getDefaultRewardAtHeight`, { height });
		return defaultRewardResponse;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getDefaultRewardAtHeight' for block height:${height}`);
		}
		logger.warn(`Error returned when invoking '${registeredRewardModule}_getDefaultRewardAtHeight' with height: ${height}.\n${err.stack}`);
		throw err;
	}
};

module.exports = {
	getRewardTokenID,
	getAnnualInflation,
	getDefaultRewardAtHeight,
	cacheRegisteredRewardModule,
};
