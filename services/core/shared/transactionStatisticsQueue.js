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
const BigNumber = require('big-number');
const Queue = require('bull');
const moment = require('moment');
const util = require('util');

const core = require('./core');
const getDbInstance = require('./pouchdb');
const config = require('../config');
const requestAll = require('./requestAll');

const logger = Logger();

const statsQueue = new Queue('statsQueue', {
	redis: config.endpoints.redis,
	limiter: {
		max: 8,
		duration: 20,
	},
	prefix: 'bullStatsQueue',
	defaultJobOptions: {
		attempts: 5,
		timeout: 5 * 60 * 1000, // ms
		removeOnComplete: true,
	},
	settings: {},
});

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
			volume: BigNumber(getWithFallback(acc, tx.type, getRange(tx)).volume).add(getTxValue(tx)),
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
	const db = await getDbInstance(config.db.collections.transaction_statistics.name);

	await db.deleteByProperty('date', date);
	statsList.map(statistic => {
		Object.assign(statistic, { date, amount_range: statistic.range });
		delete statistic['range'];
	});
	await db.writeBatch(statsList);

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
	const transactions = await requestAll(core.getTransactions, params, 20000);
	return transactions;
};

statsQueue.process(async job => {
	const { date } = job.data;
	const transactions = await fetchTransactions(date);
	const statsObject = computeTransactionStats(transactions);
	const statsList = transformStatsObjectToList(statsObject);
	return insertToDb(statsList, date);
});

statsQueue.on('active', job => {
	logger.debug('Processing transactionStatistics for', job.data);
});

statsQueue.on('completed', (job, result) => {
	logger.debug(result);
	job.remove();
});

statsQueue.on('failed', (job, error) => {
	logger.error(`Job failed: ${error}`);
	let attempt = job.data.attempt || 0;
	const delay = (attempt ** 2) * 60 * 60 * 1000; // Retry after 0,1,4,9,16,etc. hours
	attempt += 1;
	statsQueue.add({ ...job.data, attempt }, { delay });
	job.remove();
});

setInterval(async () => {
	const jobCounts = await statsQueue.getJobCounts();
	logger.debug(`Queue counters: ${util.inspect(jobCounts)}`);
}, 30000);

module.exports = statsQueue;
