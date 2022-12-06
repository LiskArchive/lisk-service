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

const getDelegate = async (address) => {
	try {
		const delegate = await invokeEndpoint('dpos_getDelegate', { address });
		return delegate;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getDelegate\'.');
		}
		throw err;
	}
};

const getAllDelegates = async () => {
	try {
		const delegates = await invokeEndpoint('dpos_getAllDelegates');
		return delegates;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getAllDelegates\'.');
		}
		throw err;
	}
};

const getPoSConstants = async () => {
	try {
		const response = await invokeEndpoint('pos_getConstants');
		if (response.error) throw new Error(response.error);
		return response;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getPoSConstants\'.');
		}
		logger.warn(`Error returned when invoking 'pos_getConstants'.\n${err.stack}`);
		throw err;
	}
};

const getPoSPendingUnlocks = async (address) => {
	try {
		const response = await invokeEndpoint('pos_getPendingUnlocks', { address });
		if (response.error) throw new Error(response.error);
		return response;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getPoSPendingUnlocks\'.');
		}
		logger.warn(`Error returned when invoking 'pos_getPendingUnlocks' with param: ${address}.\n${err.stack}`);
		throw err;
	}
};

const getStaker = async (address) => {
	try {
		const staker = await invokeEndpoint('pos_getStaker', { address });
		return staker;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getStaker\'.');
		}
		logger.warn(`Error returned when invoking 'pos_getStaker' with param: ${address}.\n${err.stack}`);
		throw err;
	}
};

const getClaimableRewards = async ({ address }) => {
	try {
		const claimableRewards = await invokeEndpoint('pos_getClaimableRewards', { address });
		return claimableRewards;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getClaimableRewards\'.');
		}
		throw err;
	}
};

module.exports = {
	getDelegate,
	getAllDelegates,
	getPoSConstants,
	getStaker,
	getPoSPendingUnlocks,
	getClaimableRewards,
};
