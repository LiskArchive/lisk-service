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
	Exceptions: { InvalidParamsException },
} = require('lisk-service-framework');

const dataService = require('../../../shared/dataService');

const getTokenBalances = async params => {
	try {
		const tokenBalances = {
			data: [],
			meta: {},
		};
		const response = await dataService.getTokenBalances(params);
		if (response.data) tokenBalances.data = response.data;
		if (response.meta) tokenBalances.meta = response.meta;

		return tokenBalances;
	} catch (error) {
		let status;
		if (error instanceof InvalidParamsException) status = 'INVALID_PARAMS';
		if (status) return { status, data: { error: error.message } };
		throw error;
	}
};

const getTokenTopBalances = async (params) => {
	const tokenTopBalances = {
		data: {},
		meta: {},
	};

	const response = await dataService.getTokenTopBalances(params);
	if (response.data) tokenTopBalances.data = response.data;
	if (response.meta) tokenTopBalances.meta = response.meta;

	return tokenTopBalances;
};

const getTokenSummary = async params => {
	const tokenSummary = {
		data: {},
		meta: {},
	};
	const response = await dataService.getTokenSummary(params);
	if (response.data) tokenSummary.data = response.data;
	if (response.meta) tokenSummary.meta = response.meta;

	return tokenSummary;
};

const tokenHasUserAccount = async params => {
	const tokenAccountExists = {
		data: {},
		meta: {},
	};
	const response = await dataService.tokenHasUserAccount(params);
	if (response.data) tokenAccountExists.data = response.data;
	if (response.meta) tokenAccountExists.meta = response.meta;

	return tokenAccountExists;
};

const getTokenConstants = async () => {
	const constants = {
		data: {},
		meta: {},
	};

	const response = await dataService.getTokenConstants();
	if (response.data) constants.data = response.data;
	if (response.meta) constants.meta = response.meta;

	return constants;
};

const getAvailableTokenIDs = async (params) => {
	const tokenIDsResponse = {
		data: {},
		meta: {},
	};

	const response = await dataService.getAvailableTokenIDs(params);
	if (response.data) tokenIDsResponse.data = response.data;
	if (response.meta) tokenIDsResponse.meta = response.meta;

	return tokenIDsResponse;
};

module.exports = {
	tokenHasUserAccount,
	getTokenBalances,
	getTokenTopBalances,
	getTokenSummary,
	getTokenConstants,
	getAvailableTokenIDs,
};
