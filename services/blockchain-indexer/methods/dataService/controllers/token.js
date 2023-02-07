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

const getTokens = async params => {
	try {
		const tokensInfo = {
			data: [],
			meta: {},
		};
		const response = await dataService.getTokens(params);
		if (response.data) tokensInfo.data = response.data;
		if (response.meta) tokensInfo.meta = response.meta;

		return tokensInfo;
	} catch (error) {
		let status;
		if (error instanceof InvalidParamsException) status = 'INVALID_PARAMS';
		if (status) return { status, data: { error: error.message } };
		throw error;
	}
};

const getTokensSummary = async params => {
	const tokensSummary = {
		data: {},
		meta: {},
	};
	const response = await dataService.getTokensSummary(params);
	if (response.data) tokensSummary.data = response.data;
	if (response.meta) tokensSummary.meta = response.meta;

	return tokensSummary;
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

module.exports = {
	tokenHasUserAccount,
	getTokens,
	getTokensSummary,
	getTokenConstants,
};
