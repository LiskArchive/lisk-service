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
		NotFoundException,
	},
	HTTP: { StatusCodes: { NOT_FOUND, BAD_REQUEST } },
	Utils: { isEmptyArray, isEmptyObject },
} = require('lisk-service-framework');

const { getAddressByAny } = require('../../../shared/accountUtils');

const dataService = require('../../../shared/dataService');

const getTransactions = async (params) => {
	try {
		if (params.senderAddress) {
			let addressLookupResult = false;
			const address = await getAddressByAny(params.senderAddress);
			if (address) addressLookupResult = true;
			params.senderAddress = address;

			if (addressLookupResult === false) {
				return {
					status: NOT_FOUND,
					data: { error: `Address ${params.senderAddress} not found.` },
				};
			}
		}

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

const getCommandsParamsSchemas = async (params) => dataService.getCommandsParamsSchemas(params);

module.exports = {
	getTransactions,
	getLastTransactions,
	getPendingTransactions,
	postTransactions,
	getCommandsParamsSchemas,
};
