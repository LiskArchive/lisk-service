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
const BluebirdPromise = require('bluebird');
const moment = require('moment');

const {
	MySQL: { getTableInstance },
	Utils: { isEmptyObject },
} = require('lisk-service-framework');

const { DB_CONSTANT, DATE_FORMAT } = require('./utils/constants');
const { requestIndexer } = require('./utils/request');

const txStatsTableSchema = require('./database/schemas/transactionStatistics');
const config = require('../config');

const MYSQL_ENDPOINT = config.endpoints.mysqlReplica;

let numTrxTypes;

const getTransactionStatisticsTable = () => getTableInstance(txStatsTableSchema, MYSQL_ENDPOINT);

const getSelector = async (params) => {
	if (!numTrxTypes) {
		const networkStatus = await requestIndexer('network.status');
		numTrxTypes = networkStatus.data.moduleCommands.length;
	}

	// max supported limit of days * #transaction types + 1 (for the default type: 'any')
	const limit = params.limit || 366 * (numTrxTypes + 1);
	const sort = 'date:desc';

	if (isEmptyObject(params)) return { sort, limit };

	const result = { property: 'date' };
	if (params.dateFrom) result.from = params.dateFrom.unix();
	if (params.dateTo) result.to = params.dateTo.unix();

	return {
		propBetweens: [result],
		sort,
		limit,
	};
};

const getStatsTimeline = async params => {
	const transactionStatisticsTable = await getTransactionStatisticsTable(MYSQL_ENDPOINT);
	const tokenStatsTimeline = {};

	await BluebirdPromise.map(
		params.tokenIDs,
		async tokenID => {
			const queryParams = await getSelector(params);
			const result = await transactionStatisticsTable.find(
				{
					...queryParams,
					whereIn: { property: 'tokenID', values: [tokenID, DB_CONSTANT.UNAVAILABLE] },
				},
				['date', 'count', 'volume'],
			);

			const unorderedfinalResult = {};
			result.forEach(entry => {
				const currFormattedDate = moment.unix(entry.date).format(params.dateFormat);

				if (!unorderedfinalResult[currFormattedDate]) {
					unorderedfinalResult[currFormattedDate] = {
						date: currFormattedDate,
						transactionCount: 0,
						volume: 0,
					};
				}

				const statForDate = unorderedfinalResult[currFormattedDate];
				statForDate.transactionCount += entry.count;
				statForDate.volume += entry.volume;
			});

			if (tokenID !== DB_CONSTANT.UNAVAILABLE) {
				const timelineRaw = Object.values(unorderedfinalResult)
					.sort((a, b) => a.date.localeCompare(b.date)).reverse();

				tokenStatsTimeline[tokenID] = timelineRaw.map((el) => ({
					...el,
					timestamp: Date.parse(el.date) / 1000,
					transactionCount: parseInt(el.transactionCount, 10),
				}));
			}
		},
		{ concurrency: params.tokenIDs.length },
	);

	return tokenStatsTimeline;
};

const getDistributionByAmount = async params => {
	const transactionStatisticsTable = await getTransactionStatisticsTable(MYSQL_ENDPOINT);
	const tokenDistributionByAmount = {};

	await BluebirdPromise.map(
		params.tokenIDs,
		async tokenID => {
			const queryParams = await getSelector(params);
			const result = (await transactionStatisticsTable.find(
				{
					...queryParams,
					whereIn: { property: 'tokenID', values: [tokenID, DB_CONSTANT.UNAVAILABLE] },
				},
				['amount_range', 'count'])).filter(o => o.count > 0);

			const unorderedfinalResult = {};
			result.forEach(entry => {
				if (!unorderedfinalResult[entry.amount_range]) unorderedfinalResult[entry.amount_range] = 0;
				unorderedfinalResult[entry.amount_range] += entry.count;
			});

			if (tokenID !== DB_CONSTANT.UNAVAILABLE) {
				const orderedFinalResult = {};
				Object.keys(unorderedfinalResult)
					.sort((a, b) => String(a).localeCompare(String(b)))
					.forEach(amountRange => {
						orderedFinalResult[amountRange] = unorderedfinalResult[amountRange];
					});

				tokenDistributionByAmount[tokenID] = orderedFinalResult;
			}
		},
		{ concurrency: params.tokenIDs.length },
	);

	return tokenDistributionByAmount;
};

const getDistributionByType = async params => {
	const transactionStatisticsTable = await getTransactionStatisticsTable(MYSQL_ENDPOINT);

	const result = (await transactionStatisticsTable.find(await getSelector(params), ['moduleCommand', 'count'])).filter(o => o.count > 0);

	const unorderedfinalResult = {};
	result.forEach(entry => {
		if (!unorderedfinalResult[entry.moduleCommand]) unorderedfinalResult[entry.moduleCommand] = 0;
		unorderedfinalResult[entry.moduleCommand] += entry.count;
	});

	const orderedFinalResult = {};
	Object.keys(unorderedfinalResult)
		.sort((a, b) => String(a).localeCompare(String(b)))
		.forEach(moduleCommand => {
			orderedFinalResult[moduleCommand] = unorderedfinalResult[moduleCommand];
		});

	return orderedFinalResult;
};

const getTransactionsStatistics = async params => {
	const transactionStatisticsTable = await getTransactionStatisticsTable(MYSQL_ENDPOINT);

	const transactionsStatistics = {
		data: {},
		meta: {},
	};

	const dateFormat = params.interval === 'day' ? DATE_FORMAT.DAY : DATE_FORMAT.MONTH;

	const dateTo = moment()
		.utc()
		.endOf(params.interval)
		.subtract(params.offset, params.interval);
	const dateFrom = moment(dateTo)
		.startOf(params.interval)
		.subtract(params.limit - 1, params.interval);

	const tokens = await transactionStatisticsTable.find({ distinct: 'tokenID' }, ['tokenID']);

	const tokenIDs = tokens.map(e => e.tokenID);

	const statsParams = {
		dateFormat,
		dateTo,
		dateFrom,
		tokenIDs,
	};

	const timeline = await getStatsTimeline(statsParams);
	const distributionByType = await getDistributionByType(statsParams);
	const distributionByAmount = await getDistributionByAmount(statsParams);

	transactionsStatistics.data = { timeline, distributionByType, distributionByAmount };

	const [{ date: minDate } = {}] = await transactionStatisticsTable.find({ sort: 'date:asc' }, 'date');
	const total = minDate ? moment().diff(moment.unix(minDate), params.interval) : 0;

	transactionsStatistics.meta = {
		limit: params.limit,
		offset: params.offset,
		total,
		duration: {
			format: dateFormat,
			from: dateFrom.format(dateFormat),
			to: dateTo.format(dateFormat),
		},
	};

	return transactionsStatistics;
};

module.exports = {
	getStatsTimeline,
	getDistributionByType,
	getDistributionByAmount,
	getTransactionsStatistics,

	// For functional tests
	getSelector,
};
