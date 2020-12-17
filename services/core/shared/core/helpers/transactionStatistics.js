// /*
//  * LiskHQ/lisk-service
//  * Copyright © 2019 Lisk Foundation
//  *
//  * See the LICENSE file at the top-level directory of this distribution
//  * for licensing information.
//  *
//  * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
//  * no part of this software, including this file, may be copied, modified,
//  * propagated, or distributed except according to the terms contained in the
//  * LICENSE file.
//  *
//  * Removal or modification of this copyright notice is prohibited.
//  *
//  */
const BigNumber = require('big-number');
const moment = require('moment');

const config = require('../../../config');
const requestAll = require('../../requestAll');
const getDbInstance = require('../../pouchdb');
const { getTransactions } = require('../transactions');

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
    const db = await getDbInstance(config.db.collections.transaction_statistics.name);

    await db.deleteByProperty('date', date);
    statsList.map(statistic => {
        Object.assign(statistic, { date, amount_range: statistic.range });
        statistic.id = String(statistic.date).concat('-').concat(statistic.amount_range);
        delete statistic.range;
        return statistic;
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
    const transactions = await requestAll(getTransactions, params, 20000);
    return transactions;
};

module.exports = {
    fetchTransactions,
    computeTransactionStats,
    transformStatsObjectToList,
    insertToDb,
};
