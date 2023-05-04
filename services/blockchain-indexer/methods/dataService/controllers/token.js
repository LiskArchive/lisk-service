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

// TODO: fetch available tokens after indexing
const getTokenTopBalances = () => ({
	data: {
		'0400000000000000': [
			{
				address: 'lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99',
				publicKey: 'b1d6bc6c7edd0673f5fed0681b73de6eb70539c21278b300f07ade277e1962cd',
				name: 'genesis_84',
				balance: '10000000',
				knowledge: {
					owner: 'Genesis Account',
					description: 'Initial supply',
				},
			},
		],
	},
	meta: {
		count: 1,
		offset: 0,
		total: 1,
	},
});

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

// TODO: fetch available tokens after indexing
const getAvailableTokenIDs = async () => ({
	data: {
		tokenIDs: [
			'0400000000000000',
		],
	},
	meta: {
		count: 1,
		offset: 0,
		total: 1,
	},
});

module.exports = {
	tokenHasUserAccount,
	getTokenBalances,
	getTokenTopBalances,
	getTokenSummary,
	getTokenConstants,
	getAvailableTokenIDs,
};
