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
	HTTP: { StatusCodes: { BAD_REQUEST } },
	Exceptions: { ValidationException, InvalidParamsException },
} = require('lisk-service-framework');

const dataService = require('../../../shared/dataService');

const getPosValidators = async params => {
	const validators = {
		data: [],
		meta: {},
	};

	try {
		const response = await dataService.getPosValidators(params);
		if (response.data) validators.data = response.data;
		if (response.meta) validators.meta = response.meta;

		return validators;
	} catch (err) {
		let status;
		if (err instanceof InvalidParamsException) status = 'INVALID_PARAMS';
		if (err instanceof ValidationException) status = BAD_REQUEST;
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

const getPosConstants = async () => {
	const constants = {
		data: {},
		meta: {},
	};

	const response = await dataService.getPosConstants();
	if (response.data) constants.data = response.data;
	if (response.meta) constants.meta = response.meta;

	return constants;
};

const getPosUnlocks = async params => {
	const unlocks = {
		data: {},
		meta: {},
	};

	const response = await dataService.getPosUnlocks(params);
	if (response.data) unlocks.data = response.data;
	if (response.meta) unlocks.meta = response.meta;

	return unlocks;
};

const getStakes = async params => {
	const stakes = {
		data: {},
		meta: {},
	};

	const response = await dataService.getStakes(params);
	if (response.data) stakes.data = response.data;
	if (response.meta) stakes.meta = response.meta;

	return stakes;
};

const getStakers = async params => {
	const stakers = {
		data: {},
		meta: {},
	};

	const response = await dataService.getStakers(params);
	if (response.data) stakers.data = response.data;
	if (response.meta) stakers.meta = response.meta;

	return stakers;
};

const getPosClaimableRewards = async (params) => {
	const claimableRewards = {
		data: [],
		meta: {},
	};

	const response = await dataService.getPosClaimableRewards(params);
	if (response.data) claimableRewards.data = response.data;
	if (response.meta) claimableRewards.meta = response.meta;

	return claimableRewards;
};

const getPosLockedRewards = async (params) => {
	try {
		const rewardsLocked = {
			data: [],
			meta: {},
		};

		const response = await dataService.getPosLockedRewards(params);
		if (response.data) rewardsLocked.data = response.data;
		if (response.meta) rewardsLocked.meta = response.meta;

		return rewardsLocked;
	} catch (err) {
		let status;
		if (err instanceof InvalidParamsException) status = 'INVALID_PARAMS';
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

module.exports = {
	getPosValidators,
	getPosConstants,
	getPosUnlocks,
	getPosLockedRewards,
	getStakes,
	getStakers,
	getPosClaimableRewards,
};
