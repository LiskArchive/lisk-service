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

const getPosValidator = async (address) => {
	try {
		const validator = await invokeEndpoint('pos_getValidator', { address });
		return validator;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getPosValidator\'.');
		}
		logger.warn(`Error returned when invoking 'pos_getValidator' with address: ${address}.\n${err.stack}`);
		throw err;
	}
};

const getAllPosValidators = async () => {
	try {
		const validators = await invokeEndpoint('pos_getAllValidators');
		return validators;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getAllPosValidators\'.');
		}
		logger.warn(`Error returned when invoking 'pos_getAllValidators'.\n${err.stack}`);
		throw err;
	}
};

const getPosValidatorsByStake = async (limit) => {
	try {
		const validators = await invokeEndpoint('pos_getValidatorsByStake', { limit });
		return validators;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getPosValidatorsByStake\'.');
		}
		logger.warn(`Error returned when invoking 'pos_getValidatorsByStake'.\n${err.stack}`);
		throw err;
	}
};

const getPosConstants = async () => {
	try {
		const response = await invokeEndpoint('pos_getConstants');
		if (response.error) throw new Error(response.error);
		return response;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getPosConstants\'.');
		}
		logger.warn(`Error returned when invoking 'pos_getConstants'.\n${err.stack}`);
		throw err;
	}
};

const getPosPendingUnlocks = async (address) => {
	try {
		const response = await invokeEndpoint('pos_getPendingUnlocks', { address });
		return response;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getPosPendingUnlocks\'.');
		}
		logger.warn(`Error returned when invoking 'pos_getPendingUnlocks' with address: ${address}.\n${err.stack}`);
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
		logger.warn(`Error returned when invoking 'pos_getStaker' with address: ${address}.\n${err.stack}`);
		throw err;
	}
};

const getPosClaimableRewards = async ({ address }) => {
	try {
		const claimableRewards = await invokeEndpoint('pos_getClaimableRewards', { address });
		return claimableRewards;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getPosClaimableRewards\'.');
		}
		logger.warn(`Error returned when invoking 'pos_getClaimableRewards' with param: ${address}.\n${err.stack}`);
		throw err;
	}
};

const getPosLockedReward = async ({ address, tokenID }) => {
	try {
		const lockedRewards = await invokeEndpoint('pos_getLockedReward', { address, tokenID });
		return lockedRewards;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getPosLockedReward\'.');
		}
		logger.warn(`Error returned when invoking 'pos_getLockedReward' with address: ${address}, tokenID: ${tokenID}.\n${err.stack}`);
		throw err;
	}
};

module.exports = {
	getPosValidator,
	getAllPosValidators,
	getPosValidatorsByStake,
	getPosLockedReward,
	getPosConstants,
	getStaker,
	getPosClaimableRewards,
	getPosPendingUnlocks,
};
