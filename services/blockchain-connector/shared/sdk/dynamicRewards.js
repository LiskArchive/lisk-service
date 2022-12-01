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
	Exceptions: { TimeoutException },
	Logger,
} = require('lisk-service-framework');

const { timeoutMessage, invokeEndpoint } = require('./client');

const logger = Logger();
let rewardTokenID;

const getRewardTokenID = async () => rewardTokenID;

const cacheRewardTokenID = async () => {
	if (typeof rewardTokenID === 'undefined') {
		try {
			// TODO: Update endpoint once exposed by SDK
			const response = await invokeEndpoint('reward_getTokenID');
			rewardTokenID = response.error ? null : response;
		} catch (err) {
			if (err.message.includes(timeoutMessage)) {
				throw new TimeoutException('Request timed out when calling \'getRewardTokenID\'.');
			}
			logger.error('Unable to cache rewardTokenID');
		}
	}
};

module.exports = {
	getRewardTokenID,
	cacheRewardTokenID,
};
