/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const moment = require('moment');
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

const CoreService = require('../../../shared/core');
const txStatisticsService = require('../../../shared/core/transactionStatistics');

const getTransactions = async (params) => {
	const addressParam = [
		'senderId',
		'recipientId',
		'senderIdOrRecipientId',
	].filter((item) => typeof params[item] === 'string');

	const addressLookupResult = await Promise.all(
		addressParam.map(async (param) => {
			const paramVal = params[param];
			const address = await CoreService.getAddressByAny(paramVal);
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
		const result = await CoreService.getTransactions({
			sort: 'timestamp:desc',
			order: 'index:asc',
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
	const result = await CoreService.getTransactions({
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

const getTransactionsStatistics = async ({
	aggregateBy,
	limit = 10,
	offset = 0,
}) => {
	limit = parseInt(limit, 10);
	offset = parseInt(offset, 10);
	const dateFormat = aggregateBy === 'day' ? 'YYYY-MM-DD' : 'YYYY-MM';

	const dateTo = moment()
		.utc()
		.endOf(aggregateBy)
		.subtract(offset, aggregateBy);
	const dateFrom = moment(dateTo)
		.startOf(aggregateBy)
		.subtract(limit - 1, aggregateBy);
	const params = {
		dateFormat,
		dateTo,
		dateFrom,
	};

	const timelineRaw = await txStatisticsService.getStatsTimeline(params);
	const timeline = timelineRaw.map((el) => ({
		...el,
		timestamp: Date.parse(el.date) / 1000,
		transactionCount: parseInt(el.transactionCount, 10),
	}));

	const distributionByType = await txStatisticsService.getDistributionByType(params);
	const distributionByAmount = await txStatisticsService.getDistributionByAmount(params);

	return {
		data: {
			timeline,
			distributionByType,
			distributionByAmount,
		},
		meta: {
			limit,
			offset,
			dateFormat,
			dateFrom: dateFrom.format(dateFormat),
			dateTo: dateTo.format(dateFormat),
		},
	};
};

const getTransactionsStatisticsDay = (params) => getTransactionsStatistics({ aggregateBy: 'day', ...params });
const getTransactionsStatisticsMonth = (params) => getTransactionsStatistics({ aggregateBy: 'month', ...params });

const getPendingTransactions = async (params) => {
	const result = await CoreService.getPendingTransactions(params);
	return {
		data: result.data,
		meta: result.meta,
	};
};

const postTransactions = async (params) => CoreService.postTransactions(params);

const getTransactionsSchemas = async (params) => CoreService.getTransactionsSchemas(params);

module.exports = {
	getTransactions,
	getLastTransactions,
	getTransactionsStatisticsDay,
	getTransactionsStatisticsMonth,
	getPendingTransactions,
	postTransactions,
	getTransactionsSchemas,
};
