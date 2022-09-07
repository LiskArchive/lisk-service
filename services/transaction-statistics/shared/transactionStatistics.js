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
} = require('lisk-service-framework');

const { requestIndexer } = require('./utils/request');

const txStatisticsIndexSchema = require('./database/schemas/transactionStatistics');
const config = require('../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

let numTrxTypes;

const getDbInstance = () => getTableInstance(
	txStatisticsIndexSchema.tableName,
	txStatisticsIndexSchema,
	MYSQL_ENDPOINT,
);

const getSelector = async (params) => {
	const result = { property: 'date' };
	if (params.dateFrom) result.from = params.dateFrom.unix();
	if (params.dateTo) result.to = params.dateTo.unix();

	if (!numTrxTypes) {
		const networkStatus = await requestIndexer('network.status');
		numTrxTypes = networkStatus.data.moduleCommands.length;
	}

	return {
		propBetweens: [result],
		sort: 'date:desc',
		// max supported limit of days * #transaction types + 1 (for the default type: 'any')
		limit: params.limit || 366 * (numTrxTypes + 1),
	};
};

const getStatsTimeline = async params => {
	const db = await getDbInstance();

	// TODO: Update code once MySql supports distinct query
	const tokens = await db.rawQuery(`SELECT DISTINCT(tokenID) FROM ${txStatisticsIndexSchema.tableName}`);

	const tokenStatsTimeline = {};

	await BluebirdPromise.map(
		tokens.map(e => e.tokenID),
		async tokenID => {
			const queryParams = await getSelector(params);
			const result = await db.find(
				{
					...queryParams,
					whereIn: { property: 'tokenID', values: [tokenID, config.CONSTANT.UNAVAILABLE] },
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

			if (tokenID !== config.CONSTANT.UNAVAILABLE) {
				const timelineRaw = Object.values(unorderedfinalResult)
					.sort((a, b) => a.date.localeCompare(b.date)).reverse();

				tokenStatsTimeline[tokenID] = timelineRaw.map((el) => ({
					...el,
					timestamp: Date.parse(el.date) / 1000,
					transactionCount: parseInt(el.transactionCount, 10),
				}));
			}
		},
		{ concurrency: tokens.length },
	);

	return tokenStatsTimeline;
};

const getDistributionByAmount = async params => {
	const db = await getDbInstance();

	// TODO: Update code once MySql supports distinct query
	const tokens = await db.rawQuery(`SELECT DISTINCT(tokenID) FROM ${txStatisticsIndexSchema.tableName}`);

	const tokenDistributionByAmount = {};

	await BluebirdPromise.map(
		tokens.map(e => e.tokenID),
		async tokenID => {
			const queryParams = await getSelector(params);
			const result = (await db.find(
				{
					...queryParams,
					whereIn: { property: 'tokenID', values: [tokenID, config.CONSTANT.UNAVAILABLE] },
				},
				['amount_range', 'count'])).filter(o => o.count > 0);

			const unorderedfinalResult = {};
			result.forEach(entry => {
				if (!unorderedfinalResult[entry.amount_range]) unorderedfinalResult[entry.amount_range] = 0;
				unorderedfinalResult[entry.amount_range] += entry.count;
			});

			if (tokenID !== config.CONSTANT.UNAVAILABLE) {
				const orderedFinalResult = {};
				Object.keys(unorderedfinalResult).sort().reverse()
					.forEach(amountRange => {
						orderedFinalResult[amountRange] = unorderedfinalResult[amountRange];
					});

				tokenDistributionByAmount[tokenID] = orderedFinalResult;
			}
		},
		{ concurrency: tokens.length },
	);

	return tokenDistributionByAmount;
};

const getDistributionByType = async params => {
	const db = await getDbInstance();

	const result = (await db.find(await getSelector(params), ['moduleCommand', 'count'])).filter(o => o.count > 0);

	const unorderedfinalResult = {};
	result.forEach(entry => {
		if (!unorderedfinalResult[entry.moduleCommand]) unorderedfinalResult[entry.moduleCommand] = 0;
		unorderedfinalResult[entry.moduleCommand] += entry.count;
	});

	const orderedFinalResult = {};
	Object.keys(unorderedfinalResult)
		.sort((a, b) => Number(a) - Number(b))
		.forEach(moduleCommand => {
			orderedFinalResult[moduleCommand] = unorderedfinalResult[moduleCommand];
		});

	return orderedFinalResult;
};

const getTransactionsStatistics = async params => {
	const transactionsStatistics = {
		data: {},
		meta: {},
	};

	const dateFormat = params.interval === 'day' ? 'YYYY-MM-DD' : 'YYYY-MM';

	const dateTo = moment()
		.utc()
		.endOf(params.interval)
		.subtract(params.offset, params.interval);
	const dateFrom = moment(dateTo)
		.startOf(params.interval)
		.subtract(params.limit - 1, params.interval);
	const statsParams = {
		dateFormat,
		dateTo,
		dateFrom,
	};

	const timeline = await getStatsTimeline(statsParams);
	const distributionByType = await getDistributionByType(statsParams);
	const distributionByAmount = await getDistributionByAmount(statsParams);

	transactionsStatistics.data = { timeline, distributionByType, distributionByAmount };

	transactionsStatistics.meta = {
		limit: params.limit,
		offset: params.offset,
		dateFormat,
		dateFrom: dateFrom.format(dateFormat),
		dateTo: dateTo.format(dateFormat),
	};

	return transactionsStatistics;
};

module.exports = {
	getStatsTimeline,
	getDistributionByType,
	getDistributionByAmount,
	getTransactionsStatistics,
};
