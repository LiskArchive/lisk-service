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

const logger = Logger();

const moment = require('moment');
const transactionStatisticsQueue = require('./transactionStatisticsQueue');
const { getDatabase, dbQueries } = require('./postgres');

const transformParamsForDb = ({ dateFrom, dateTo, ...rest }) => ({
	...rest,
	dateFrom: moment(dateFrom).format('YYYY-MM-DD'),
	dateTo: moment(dateTo).format('YYYY-MM-DD'),
});

const database = getDatabase();

const getStatsTimeline = async params => {
	const result = await database.any(`SELECT to_char(timestamp, $<dateFormat>)
		AS date, sum(count) AS "transactionCount", SUM(volume) AS volume 
		FROM transaction_statistics 
		WHERE $<dateFrom> <= timestamp AND timestamp <= $<dateTo>
		GROUP BY to_char(timestamp, $<dateFormat>)
		ORDER BY to_char(timestamp, $<dateFormat>) DESC`, transformParamsForDb(params));
	return result;
};

const getDistributionByAmount = async params => {
	const result = await database.any(`SELECT amount_range, sum(count)
		AS count FROM transaction_statistics
		WHERE $<dateFrom> <= timestamp AND timestamp <= $<dateTo>
		GROUP BY amount_range
		ORDER BY amount_range DESC`, transformParamsForDb(params));
	return result;
};

const getDistributionByType = async params => {
	const result = await database.any(`SELECT type, sum(count) AS count FROM transaction_statistics
		WHERE $<dateFrom> <= timestamp AND timestamp <= $<dateTo>
		GROUP BY type
		ORDER BY type ASC`, transformParamsForDb(params));
	return result;
};

const ensureDbTableIsCreated = async () => {
	try {
		const db = getDatabase();
		const tableExists = await db.any('SELECT to_regclass($1)', dbQueries.tableName);

		if (!tableExists[0].to_regclass) {
			await db.any(dbQueries.createTable);
			logger.debug(`Initialized postgres table: ${dbQueries.tableName}`);
		}
	} catch (error) {
		logger.error(`Failed to initialize postgres table: ${dbQueries.tableName}. Error: ${error}`);
	}
};

const fetchTransactionsForPastNDays = n => {
	const db = getDatabase();
	[...Array(n)].forEach(async (_, i) => {
		const date = moment().subtract(i, 'day').utc().startOf('day')
			.toDate();
		const shouldUpdate = i === 0 || !(await db.oneOrNone(dbQueries.selectDay, { date }));
		if (shouldUpdate) {
			transactionStatisticsQueue.add({ date });
		}
	});
};

const init = async historyLengthDays => {
	await ensureDbTableIsCreated();
	fetchTransactionsForPastNDays(historyLengthDays);
};

const updateTodayStats = async () => fetchTransactionsForPastNDays(1);

module.exports = {
	getStatsTimeline,
	getDistributionByType,
	getDistributionByAmount,
	init,
	updateTodayStats,
};
