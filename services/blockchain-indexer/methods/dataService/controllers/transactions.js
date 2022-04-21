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
	HTTP,
	Utils,
	Exceptions: {
		InvalidParamsException,
		ValidationException,
		NotFoundException,
	},
} = require('lisk-service-framework');

const { StatusCodes: { NOT_FOUND, BAD_REQUEST } } = HTTP;
const { isEmptyArray, isEmptyObject } = Utils.Data;

const dataService = require('../../../shared/dataService');

const {
	getAddressByAny,
} = require('../../../shared/accountUtils');

const getTransactions = async (params) => {
	const addressParam = [
		'senderId',
		'recipientId',
		'senderIdOrRecipientId',
	].filter((item) => typeof params[item] === 'string');

	const addressLookupResult = await Promise.all(
		addressParam.map(async (param) => {
			const paramVal = params[param];
			const address = await getAddressByAny(paramVal);
			if (!address) return false;
			params[param] = address;
			return true;
		}),
	);
	if (addressLookupResult.includes(false)) {
		return {
			status: NOT_FOUND,
			data: { error: `Account ${params[addressParam[0]]} not found.` },
		};
	}
	try {
		const result = await dataService.getTransactions({
			sort: 'timestamp:desc',
			...params,
		});

		if (isEmptyObject(result) || isEmptyArray(result.data)) {
			return { status: NOT_FOUND, data: { error: 'Not found.' } };
		}

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
		if (err instanceof NotFoundException) status = NOT_FOUND;
		if (err.message.includes('does not exist')) status = NOT_FOUND;
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

const getLastTransactions = async (params) => {
	const result = await dataService.getTransactions({
		...params,
		sort: 'timestamp:desc',
	});

	const meta = {
		count: result.data.length,
		limit: result.meta.limit,
		offset: result.meta.offset,
		total: result.meta.count,
	};

	return {
		data: {
			data: result.data,
			meta,
		},
	};
};

const getPendingTransactions = async (params) => {
	const result = await dataService.getPendingTransactions(params);
	return {
		data: result.data,
		meta: result.meta,
	};
};

const postTransactions = async (params) => dataService.postTransactions(params);

const getTransactionsSchemas = async (params) => dataService.getTransactionsSchemas(params);

module.exports = {
	getTransactions,
	getLastTransactions,
	getPendingTransactions,
	postTransactions,
	getTransactionsSchemas,
};
