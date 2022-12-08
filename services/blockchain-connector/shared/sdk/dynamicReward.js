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

const logger = Logger();

let rewardTokenID;

const getRewardTokenID = async () => {
	if (!rewardTokenID) {
		try {
			// TODO: Update endpoint once exposed by SDK
			// Ref: https://github.com/LiskHQ/lisk-sdk/issues/7834
			let response = await invokeEndpoint('dynamicReward_getRewardTokenID');
			if (response.error) {
				response = await invokeEndpoint('reward_getRewardTokenID');
			}
			rewardTokenID = response.error ? null : response;
		} catch (err) {
			if (err.message.includes(timeoutMessage)) {
				throw new TimeoutException('Request timed out when calling \'getRewardTokenID\'.');
			}
			throw err;
		}
	}
	return rewardTokenID;
};

const getInflationRate = async () => {
	try {
		// TODO: Update endpoint once exposed by sdk
		// Ref: https://github.com/LiskHQ/lisk-sdk/issues/7799
		const inflationRate = await invokeEndpoint('reward_getInflationRate');
		return inflationRate;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getInflationRate\'.');
		}
		logger.warn(`Error returned when invoking 'reward_getInflationRate'.\n${err.stack}`);

		throw err;
	}
};

const getDefaultRewardAtHeight = async height => {
	try {
		// TODO: Update endpoint once exposed by sdk
		// Ref: https://github.com/LiskHQ/lisk-sdk/issues/7865
		let defaultRewardResponse = await invokeEndpoint('dynamicReward_getDefaultRewardAtHeight', { height });
		if (defaultRewardResponse.error) {
			defaultRewardResponse = await invokeEndpoint('reward_getDefaultRewardAtHeight');
		}
		return defaultRewardResponse;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getDefaultRewardAtHeight' for block height:${height}`);
		}
		logger.warn(`Error returned when invoking 'reward_getDefaultRewardAtHeight' with height: ${height}.\n${err.stack}`);

		throw err;
	}
};

module.exports = {
	getRewardTokenID,
	getInflationRate,
	getDefaultRewardAtHeight,
};
