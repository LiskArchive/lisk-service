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
	Exceptions: {
		InvalidParamsException,
		ValidationException,
	},
	HTTP: { StatusCodes: { NOT_FOUND, BAD_REQUEST } },
} = require('lisk-service-framework');

const { confirmAddress } = require('../../../shared/accountUtils');

const dataService = require('../../../shared/dataService');

const getTransactions = async (params) => {
	try {
		const addressParam = [
			'senderAddress',
			'recipientAddress',
			'address',
		].filter((item) => typeof params[item] === 'string');

		const addressLookupResult = await Promise.all(
			addressParam.map(async (param) => {
				const paramVal = params[param];
				const address = await confirmAddress(paramVal);
				return address;
			}),
		);

		const NOT_FOUND_RESPONSE = { status: NOT_FOUND, data: { error: 'Not found.' } };

		if (addressLookupResult.includes(false)) {
			return NOT_FOUND_RESPONSE;
		}

		const result = await dataService.getTransactions({
			sort: 'timestamp:desc',
			...params,
		});

		const meta = {
			count: result.data.length,
			offset: result.meta.offset || 0,
			total: result.meta.total || result.meta.count,
		};

		return {
			data: result.data,
			meta,
			link: {},
		};
	} catch (err) {
		let status;
		if (err instanceof InvalidParamsException) status = 'INVALID_PARAMS';
		if (err instanceof ValidationException) status = BAD_REQUEST;
		if (err.message.includes('does not exist')) status = NOT_FOUND;
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

const getPendingTransactions = async (params) => {
	const result = await dataService.getPendingTransactions(params);
	return {
		data: result.data,
		meta: result.meta,
	};
};

const postTransactions = async (params) => dataService.postTransactions(params);

const getSchemas = async () => dataService.getSchemas();

const dryRunTransactions = async (params) => dataService.dryRunTransactions(params);

module.exports = {
	getTransactions,
	getPendingTransactions,
	postTransactions,
	getSchemas,
	dryRunTransactions,
};
