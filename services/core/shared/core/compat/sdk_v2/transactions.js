/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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

const coreApi = require('./coreApi');
const {
	getBlockchainTime,
	validateTimestamp,
	getUnixTime,
} = require('../common');

const MAX_TX_LIMIT_PP = 100;

const getTransactions = async params => {
	const transactions = {
		data: [],
		meta: {},
	};
	await Promise.all(['fromTimestamp', 'toTimestamp'].map(async (timestamp) => {
		if (await validateTimestamp(params[timestamp])) {
			params[timestamp] = await getBlockchainTime(params[timestamp]);
		}
		return Promise.resolve();
	}),
	);

	const response = await coreApi.getTransactions(params);
	if (response.data) transactions.data = response.data;
	if (response.meta) transactions.meta = response.meta;

	if (Object.getOwnPropertyNames(transactions).length) {
		transactions.data = await BluebirdPromise.map(
			transactions.data,
			async transaction => {
				transaction.unixTimestamp = await getUnixTime(transaction.timestamp);
				return transaction;
			},
			{ concurrency: transactions.data.length },
		);
	}
	transactions.meta.total = transactions.meta.count;
	transactions.meta.count = transactions.data.length;
	transactions.meta.offset = params.offset;
	return transactions;
};

const getTransactionById = id => getTransactions({ id });
const getTransactionsByBlockId = blockId => getTransactions({ blockId, limit: MAX_TX_LIMIT_PP });

module.exports = {
	getTransactions,
	getTransactionById,
	getTransactionsByBlockId,
};
