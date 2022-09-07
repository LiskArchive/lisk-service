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
const BigNumber = require('big-number');

const {
	Logger,
	Queue,
	MySQL: {
		getDbConnection,
		getTableInstance,
		startDbTransaction,
		commitDbTransaction,
		rollbackDbTransaction,
	},
	Signals,
} = require('lisk-service-framework');

const { getDistributionByType } = require('./transactionStatistics');
const { resolveGlobalTokenID } = require('./utils/constants');
const { requestIndexer } = require('./utils/request');
const requestAll = require('./utils/requestAll');

const txStatisticsIndexSchema = require('./database/schemas/transactionStatistics');
const config = require('../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getDbInstance = () => getTableInstance(
	txStatisticsIndexSchema.tableName,
	txStatisticsIndexSchema,
	MYSQL_ENDPOINT,
);

const getWithFallback = (acc, moduleCommand, range) => {
	const defaultValue = {
		count: 0,
		volume: 0,
		tokenID: config.CONSTANT.UNAVAILABLE,
	};
	return acc[moduleCommand]
		? acc[moduleCommand][range] || defaultValue
		: defaultValue;
};

const getTxValue = tx => BigNumber(tx.params.amount).plus(tx.fee);

const getRange = tx => {
	const value = getTxValue(tx);
	const lowerBound = Math.pow(10, Math.floor(Math.log10(value / 1e8)));
	const upperBound = Math.pow(10, Math.floor(Math.log10(value / 1e8)) + 1);
	return `${lowerBound}_${upperBound}`;
};

const getInitialValueToEnsureEachDayHasAtLeastOneEntry = () => {
	const transaction = {
		moduleCommand: config.CONSTANT.ANY,
		params: { amount: String(1e8) },
		fee: String(1e7),
	};
	return {
		[transaction.moduleCommand]: {
			[getRange(transaction)]: getWithFallback({}),
		},
	};
};

const computeTransactionStats = transactions => transactions.reduce((acc, tx) => ({
	...acc,
	[tx.moduleCommand]: {
		...acc[tx.moduleCommand],
		[getRange(tx)]: {
			count: getWithFallback(acc, tx.moduleCommand, getRange(tx)).count + 1,
			volume: BigNumber(getWithFallback(acc, tx.moduleCommand, getRange(tx)).volume)
				.add(getTxValue(tx)),
			tokenID: resolveGlobalTokenID(tx.params.tokenID),
		},
	},
}), getInitialValueToEnsureEachDayHasAtLeastOneEntry());

const transformStatsObjectToList = statsObject => (
	Object.entries(statsObject).reduce((acc, [moduleCommand, rangeObject]) => ([
		...acc,
		...Object.entries(rangeObject).map(([range, { count, volume, tokenID }]) => ({
			moduleCommand,
			volume: Math.ceil(volume),
			count,
			range,
			tokenID,
		})),
	]), [])
);

const insertToDb = async (statsList, date) => {
	const db = await getDbInstance();
	const connection = await getDbConnection();
	const trx = await startDbTransaction(connection);
	try {
		try {
			const [{ id }] = db.find({ date, limit: 1 }, ['id']);
			await db.deleteByPrimaryKey([id]);
			logger.debug(`Removed the following date from the database: ${date}`);
		} catch (err) {
			logger.debug(`The database does not contain the entry with the following date: ${date}`);
		}

		statsList.map(statistic => {
			Object.assign(statistic, { date, amount_range: statistic.range });
			statistic.id = String(statistic.date)
				.concat('-', statistic.moduleCommand)
				.concat('-', statistic.amount_range);
			delete statistic.range;
			return statistic;
		});
		await db.upsert(statsList, trx);
		await commitDbTransaction(trx);
		const count = statsList.reduce((acc, row) => acc + row.count, 0);
		return `${statsList.length} rows with total tx count ${count} for ${date} inserted to db`;
	} catch (error) {
		await rollbackDbTransaction(trx);
		throw error;
	}
};

const fetchTransactions = async (date) => {
	const params = {
		timestamp: `${moment.unix(date).unix()}:${moment.unix(date).add(1, 'day').unix()}`,
	};
	const txMeta = (await requestIndexer('transactions', { ...params, limit: 1 })).meta;
	const maxCount = txMeta ? txMeta.total : 1000;
	const result = await requestAll(requestIndexer, 'transactions', { ...params, limit: 100 }, maxCount);
	const transactions = result.error ? [] : result;
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

const queueName = 'transactionStats';
const transactionStatisticsQueue = Queue(
	config.endpoints.redis,
	queueName,
	queueJob,
	1,
	config.queue.default,
);

const fetchTransactionsForPastNDays = async (n, forceReload = false) => {
	const db = await getDbInstance();
	const scheduledDays = [];
	for (let i = 0; i < n; i++) {
		/* eslint-disable no-await-in-loop */
		const date = moment().subtract(i, 'day').utc().startOf('day')
			.unix();

		const shouldUpdate = i === 0 || !((await db.find({ date, limit: 1 }, ['id'])).length);

		if (shouldUpdate || forceReload) {
			const formattedDate = moment.unix(date).format('YYYY-MM-DD');
			logger.debug(`Adding day ${i + 1}, ${formattedDate} to the queue`);
			await transactionStatisticsQueue.add({ date });
			logger.info(`Added day ${i + 1}, ${formattedDate} to the queue`);
			scheduledDays.push(formattedDate.toString());
		}
		if (scheduledDays.length === n) {
			logger.info(`Scheduled statistics calculation for ${scheduledDays.length} days (${scheduledDays[scheduledDays.length - 1]} - ${scheduledDays[0]})`);
		}
		/* eslint-enable no-await-in-loop */
	}
};

const updateTodayStats = async () => fetchTransactionsForPastNDays(1, true);

const validateTransactionStatistics = async historyLengthDays => {
	const dateTo = moment().utc().endOf('day').subtract(0, 'day');
	const dateFrom = moment(dateTo).startOf('day').subtract(historyLengthDays, 'day');
	const params = {
		dateFormat: 'YYYY-MM-DD',
		dateTo,
		dateFrom,
	};

	const distributionByType = await getDistributionByType(params);

	const verifyStatistics = await BluebirdPromise.map(
		Object.keys(distributionByType),
		async moduleCommand => {
			const fromTimestamp = Math.floor((moment.unix(dateFrom).unix()) / 1000);
			const toTimestamp = Math.floor((moment.unix(dateTo).unix()) / 1000);

			const { meta: { total } } = await requestIndexer('getTransactions', {
				moduleCommand,
				timestamp: `${fromTimestamp}:${toTimestamp}`,
				limit: 1,
			});
			return total === distributionByType[moduleCommand];
		},
		{ concurrency: Object.keys(distributionByType).length },
	);

	const isStatsProperlyBuilt = verifyStatistics.every(isVerified => isVerified);
	if (!isStatsProperlyBuilt) await fetchTransactionsForPastNDays(historyLengthDays, true);
};

const init = async historyLengthDays => {
	await fetchTransactionsForPastNDays(historyLengthDays, true);
	logger.debug(`============== 'transactionStatsReady' signal: ${Signals.get('transactionStatsReady')} ==============`);
	Signals.get('transactionStatsReady').dispatch(historyLengthDays);
};

module.exports = {
	init,
	updateTodayStats,
	validateTransactionStatistics,
};
