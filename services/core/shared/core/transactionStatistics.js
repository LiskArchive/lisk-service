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
const { Logger } = require('lisk-service-framework');
const moment = require('moment');
const BigNumber = require('big-number');

const config = require('../../config');
const requestAll = require('../requestAll');
const { getTransactions } = require('./transactions');
const { initializeQueue } = require('./queue');
const mysql = require('../indexdb/mysql');

const logger = Logger();

const tableConfig = {
	primaryKey: 'id',
	schema: {
		id: { type: 'string' },
		date: { type: 'integer' },
		numberOfTransactions: { type: 'integer' },
	},
	indexes: {
		date: { type: 'range' },
	},
};

const getDbInstance = () => mysql('transaction_statistics', tableConfig);

const queueName = 'transactionStatisticsQueue';
const queueOptions = config.queue[queueName];

const getSelector = (params) => {
	const result = { property: 'date' };
	if (params.dateFrom) result.from = params.dateFrom.unix();
	if (params.dateTo) result.to = params.dateTo.unix();
	return { propBetweens: [result] };
};

const getWithFallback = (acc, type, range) => {
	const defaultValue = {
		count: 0,
		volume: 0,
	};
	return acc[type]
		? acc[type][range] || defaultValue
		: defaultValue;
};

const getTxValue = tx => BigNumber(tx.amount).plus(tx.fee);

const getRange = tx => {
	const value = getTxValue(tx);
	const lowerBound = Math.pow(10, Math.floor(Math.log10(value / 1e8)));
	const upperBound = Math.pow(10, Math.floor(Math.log10(value / 1e8)) + 1);
	return `${lowerBound}_${upperBound}`;
};

const getInitialValueToEnsureEachDayHasAtLeastOneEntry = () => {
	const transaction = {
		type: 0,
		amount: String(1e8),
		fee: String(1e7),
	};
	return {
		[transaction.type]: {
			[getRange(transaction)]: getWithFallback({}),
		},
	};
};

const computeTransactionStats = transactions => transactions.reduce((acc, tx) => ({
	...acc,
	[tx.type]: {
		...acc[tx.type],
		[getRange(tx)]: {
			count: getWithFallback(acc, tx.type, getRange(tx)).count + 1,
			volume: BigNumber(getWithFallback(acc, tx.type,
				getRange(tx)).volume).add(getTxValue(tx)),
		},
	},
}), getInitialValueToEnsureEachDayHasAtLeastOneEntry());

const transformStatsObjectToList = statsObject => (
	Object.entries(statsObject).reduce((acc, [type, rangeObject]) => ([
		...acc,
		...Object.entries(rangeObject).map(([range, { count, volume }]) => ({
			type: Number(type),
			volume: Math.ceil(volume),
			count,
			range,
		})),
	]), [])
);

const insertToDb = async (statsList, date) => {
	const db = await getDbInstance();

	try {
		const [{ id }] = db.find({ date });
		await db.deleteIds([id]);
		logger.debug(`Removed the following date from the database: ${date}`);
	} catch (err) {
		logger.debug(`The database does not contain the entry with the following date: ${date}`);
	}

	statsList.map(statistic => {
		Object.assign(statistic, { date, amount_range: statistic.range });
		statistic.id = String(statistic.date).concat('-').concat(statistic.amount_range);
		delete statistic.range;
		return statistic;
	});
	await db.upsert(statsList);

	const count = statsList.reduce((acc, row) => acc + row.count, 0);
	return `${statsList.length} rows with total tx count ${count} for ${date} inserted to db`;
};

const fetchTransactions = async (date, offset = 0) => {
	const limit = 100;
	const params = {
		fromTimestamp: moment(date).unix(),
		toTimestamp: moment(date).add(1, 'day').unix(),
		limit,
		offset,
	};
	const transactions = await requestAll(getTransactions, params, 20000);
	return transactions;
};

const queueJob = async (job) => {
	const { date } = job.data;
	if (!date) {
		return Promise.reject(new Error('Missing date'));
	}
	try {
		const transactions = await fetchTransactions(date);
		const statsObject = computeTransactionStats(transactions);
		const statsList = transformStatsObjectToList(statsObject);
		return insertToDb(statsList, date);
	} catch (err) {
		return Promise.reject(err);
	}
};

const transactionStatisticsQueue = initializeQueue(queueName, queueJob, queueOptions);

const getStatsTimeline = async params => {
	const db = await getDbInstance();

	const result = await db.find(getSelector(params));

	const unorderedfinalResult = {};
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

	const orderedFinalResult = Object.values(unorderedfinalResult)
		.sort((a, b) => a.date.localeCompare(b.date)).reverse();
	// 	ORDER BY to_char(timestamp, $<dateFormat>) DESC`, transformParamsForDb(params));

	return orderedFinalResult;
};

const getDistributionByAmount = async params => {
	const db = await getDbInstance();

	const result = await db.find(getSelector(params));

	const unorderedfinalResult = {};
	result.forEach(entry => {
		if (!unorderedfinalResult[entry.amount_range]) unorderedfinalResult[entry.amount_range] = 0;
		unorderedfinalResult[entry.amount_range] += entry.count;
		// SELECT amount_range, sum(count) AS count FROM transaction_statistics
		// 	GROUP BY amount_range
	});

	const orderedFinalResult = {};
	Object.keys(unorderedfinalResult).sort().reverse()
		.forEach(amountRange => orderedFinalResult[amountRange] = unorderedfinalResult[amountRange]);
	// 	ORDER BY amount_range DESC`, transformParamsForDb(params));

	return orderedFinalResult;
};

const getDistributionByType = async params => {
	const db = await getDbInstance();

	const result = await db.find(getSelector(params));

	const unorderedfinalResult = {};
	result.forEach(entry => {
		if (!unorderedfinalResult[entry.type]) unorderedfinalResult[entry.type] = 0;
		unorderedfinalResult[entry.type] += entry.count;
		// SELECT type, sum(count) AS count FROM transaction_statistics
		// 	GROUP BY type
	});

	const orderedFinalResult = {};
	Object.keys(unorderedfinalResult).sort((a, b) => Number(a) - Number(b))
		.forEach(type => orderedFinalResult[type] = unorderedfinalResult[type]);
	// 	ORDER BY type ASC`, transformParamsForDb(params));

	return orderedFinalResult;
};

const fetchTransactionsForPastNDays = async n => {
	const db = await getDbInstance();
	[...Array(n)].forEach(async (_, i) => {
		const date = moment().subtract(i, 'day').utc().startOf('day')
			.unix();
		const shouldUpdate = i === 0 || !((await db.find({ date })).length);
		if (shouldUpdate) {
			let attempt = 0;
			const options = {
				delay: (attempt ** 2) * 60 * 60 * 1000,
				attempt: attempt += 1,
			};
			transactionStatisticsQueue.add(queueName, { date, options });
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
