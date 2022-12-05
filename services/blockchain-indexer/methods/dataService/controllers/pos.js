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

const getDelegates = async params => {
	const delegates = {
		data: [],
		meta: {},
	};

	try {
		const response = await dataService.getDelegates(params);
		if (response.data) delegates.data = response.data;
		if (response.meta) delegates.meta = response.meta;

		return delegates;
	} catch (err) {
		let status;
		if (err instanceof InvalidParamsException) status = 'INVALID_PARAMS';
		if (err instanceof ValidationException) status = BAD_REQUEST;
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

const getPoSConstants = async () => {
	const constants = {
		data: {},
		meta: {},
	};

	const response = await dataService.getPoSConstants();
	if (response.data) constants.data = response.data;
	if (response.meta) constants.meta = response.meta;

	return constants;
};

const getPoSUnlocks = async params => {
	const unlocks = {
		data: {},
		meta: {},
	};

	const response = await dataService.getPoSUnlocks(params);
	if (response.data) unlocks.data = response.data;
	if (response.meta) unlocks.meta = response.meta;

	return unlocks;
};

const getPoSStakers = async params => {
	const stakers = {
		data: {},
		meta: {},
	};

	const response = await dataService.getPoSStakers(params);
	if (response.data) stakers.data = response.data;
	if (response.meta) stakers.meta = response.meta;

	return stakers;
};

const getVotesSent = async params => {
	const votesSent = {
		data: {},
		meta: {},
	};

	const response = await dataService.getVotesSent(params);
	if (response.data) votesSent.data = response.data;
	if (response.meta) votesSent.meta = response.meta;

	return votesSent;
};

module.exports = {
	getDelegates,
	getPoSConstants,
	getPoSUnlocks,
	getPoSStakers,
	getVotesSent,
};

