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
	Exceptions: { ValidationException },
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

const getForgers = async params => {
	const nextForgers = await dataService.getForgers(params);
	if (isEmptyObject(nextForgers)) return {};

	return {
		data: nextForgers.data,
		meta: nextForgers.meta,
	};
};

const getLegacyAccountInfo = async params => {
	const legacyAccountInfo = await dataService.getLegacyAccountInfo(params);

	return {
		data: legacyAccountInfo.data,
		meta: legacyAccountInfo.meta,
	};
};

module.exports = {
	getAccounts,
	getForgers,
	getLegacyAccountInfo,
};
