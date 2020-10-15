/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
// const { Logger } = require('lisk-service-framework');
const moment = require('moment');

const transactionStatisticsQueue = require('./transactionStatisticsQueue');
const getDbInstance = require('./pouchdb');
const config = require('../config');

// const logger = Logger();

const getStatsTimeline = async params => {
	const db = await getDbInstance(config.db.collections.transaction_statistics.name);

	const result = await db.find({
		selector: {
			date: {
				$gte: params.dateFrom.toISOString(),
				$lte: params.dateTo.toISOString(),
			},
			// 	WHERE $<dateFrom> <= timestamp AND timestamp <= $<dateTo>
		},
	});

	const unorderedfinalResult = {};
	const finalResult = [];

	result.forEach(entry => {
		const currFormattedDate = moment(entry.date).format(params.dateFormat);
		if (!unorderedfinalResult[currFormattedDate]) {
			unorderedfinalResult[currFormattedDate] = {
				date: currFormattedDate,
				transactionCount: 0,
				volume: 0,
			};
		}
		// 	GROUP BY to_char(timestamp, $<dateFormat>)

		const statForDate = unorderedfinalResult[currFormattedDate];
		statForDate.transactionCount += entry.count;
		statForDate.volume += entry.volume;
		// SELECT to_char(timestamp, $<dateFormat>) AS date, sum(count) AS "transactionCount",
		// SUM(volume) AS volume FROM transaction_statistics
	});

	Object.keys(unorderedfinalResult).sort((a, b) => a.date.localeCompare(b.date))
		.reverse().forEach(date => finalResult.push(unorderedfinalResult[date]));
	// 	ORDER BY to_char(timestamp, $<dateFormat>) DESC`, transformParamsForDb(params));

	return finalResult;
};

const getDistributionByAmount = async params => {
	const db = await getDbInstance(config.db.collections.transaction_statistics.name);

	const result = await db.find({
		selector: {
			date: {
				$gte: params.dateFrom.toISOString(),
				$lte: params.dateTo.toISOString(),
			},
			// 	WHERE $<dateFrom> <= timestamp AND timestamp <= $<dateTo>
		},
	});

	const unorderedfinalResult = {};
	const orderedFinalResult = {};

	result.forEach(entry => {
		if (!unorderedfinalResult[entry.amount_range]) unorderedfinalResult[entry.amount_range] = 0;
		unorderedfinalResult[entry.amount_range] += entry.count;
		// SELECT amount_range, sum(count) AS count FROM transaction_statistics
		// 	GROUP BY amount_range
	});
	Object.keys(unorderedfinalResult).sort().reverse()
		.forEach(amountRange => orderedFinalResult[amountRange] = unorderedfinalResult.amount_range);
	// 	ORDER BY amount_range DESC`, transformParamsForDb(params));

	return orderedFinalResult;
};

const getDistributionByType = async params => {
	const db = await getDbInstance(config.db.collections.transaction_statistics.name);

	const result = await db.find({
		selector: {
			date: {
				$gte: params.dateFrom.toISOString(),
				$lte: params.dateTo.toISOString(),
			},
			// 	WHERE $<dateFrom> <= timestamp AND timestamp <= $<dateTo>
		},
	});

	const unorderedfinalResult = {};
	const orderedFinalResult = {};

	result.forEach(entry => {
		if (!unorderedfinalResult[entry.type]) unorderedfinalResult[entry.type] = 0;
		unorderedfinalResult[entry.type] += entry.count;
		// SELECT type, sum(count) AS count FROM transaction_statistics
		// 	GROUP BY type
	});
	Object.keys(unorderedfinalResult).sort((a, b) => Number(a) - Number(b))
		.forEach(type => orderedFinalResult[type] = unorderedfinalResult[type]);
	// 	ORDER BY type ASC`, transformParamsForDb(params));

	return orderedFinalResult;
};

const fetchTransactionsForPastNDays = async n => {
	const db = await getDbInstance(config.db.collections.transaction_statistics.name);
	[...Array(n)].forEach(async (_, i) => {
		const date = moment().subtract(i, 'day').utc().startOf('day')
			.toISOString();
		const shouldUpdate = i === 0 || !(await db.findOneByProperty('date', date));
		if (shouldUpdate) {
			transactionStatisticsQueue.add({ date });
		}
	});
};

const init = async historyLengthDays => fetchTransactionsForPastNDays(historyLengthDays);

const updateTodayStats = async () => fetchTransactionsForPastNDays(1);

module.exports = {
	getStatsTimeline,
	getDistributionByType,
	getDistributionByAmount,
	init,
	updateTodayStats,
};
