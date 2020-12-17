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

const getTransactions = async params => {
	await Promise.all(['fromTimestamp', 'toTimestamp'].map(async (timestamp) => {
		if (await validateTimestamp(params[timestamp])) {
			params[timestamp] = await getBlockchainTime(params[timestamp]);
		}
		return Promise.resolve();
	}),
	);

	const transactions = await coreApi.getTransactions(params);
	transactions.data = await BluebirdPromise.map(
		transactions.data,
		async transaction => {
			transaction.unixTimestamp = await getUnixTime(transaction.timestamp);
			return transaction;
		},
		{ concurrency: transactions.data.length },
	);
	return transactions;
};

module.exports = { getTransactions };
