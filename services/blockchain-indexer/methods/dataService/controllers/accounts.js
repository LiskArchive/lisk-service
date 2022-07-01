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
	Utils,
	HTTP,
	Exceptions: { ValidationException, InvalidParamsException },
} = require('lisk-service-framework');

const { StatusCodes: { BAD_REQUEST } } = HTTP;

const dataService = require('../../../shared/dataService');

const ObjectUtilService = Utils.Data;
const { isEmptyObject } = ObjectUtilService;

const logger = Logger();

const getAccounts = async params => {
	try {
		logger.debug(`Retrieving account ${params.publicKey || params.address || params.username || '(params)'}`);

		const accounts = {
			data: [],
			meta: {},
		};

		const response = params.isDelegate
			? await dataService.getDelegates({ sort: 'rank:asc', ...params })
			: await dataService.getAccounts({ sort: 'balance:desc', ...params });

		if (response.data) accounts.data = response.data;
		if (response.meta) accounts.meta = response.meta;

		return accounts;
	} catch (err) {
		let status;
		if (err instanceof ValidationException) status = BAD_REQUEST;
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

const getGenerators = async params => {
	const generators = await dataService.getGenerators(params);
	if (isEmptyObject(generators)) return {};

	return {
		data: generators.data,
		meta: generators.meta,
	};
};

// eslint-disable-next-line no-unused-vars
const getLegacyAccountInfo = async params => {
	// const legacyAccountInfo = {
	// 	data: {},
	// 	meta: {},
	// };

	// const response = await dataService.getLegacyAccountInfo(params);
	// if (response.data) legacyAccountInfo.data = response.data;
	// if (response.meta) legacyAccountInfo.meta = response.meta;

	const legacyAccountInfo = {
		data: {
			legacyAddress: '3057001998458191401L',
			address: 'lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu',
			balance: '10000000',
		},
		meta: {
			publicKey: 'd5aa0d647b5d9ff0285321d606c870348711266ea8f0df627ef8f39d1c9959c7',
		},
	};

	return legacyAccountInfo;
};

const getTokensInfo = async params => {
	try {
		const tokensInfo = await dataService.getTokensInfo(params);

		return {
			data: tokensInfo.data,
			meta: tokensInfo.meta,
		};
	} catch (error) {
		let status;
		if (error instanceof InvalidParamsException) status = 'INVALID_PARAMS';
		if (status) return { status, data: { error: error.message } };
		throw error;
	}
};

module.exports = {
	getAccounts,
	getGenerators,
	getLegacyAccountInfo,
	getTokensInfo,
};
