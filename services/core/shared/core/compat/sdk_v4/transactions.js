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
const signals = require('../../../signals');

const mysqlIdx = require('../../../indexdb/mysql');
const blockIdxSchema = require('./schema/blocks');
const transactionIdxSchema = require('./schema/transactions');

const getBlockIdx = () => mysqlIdx('blockIdx', blockIdxSchema);
const getTransactionIdx = () => mysqlIdx('transactionIdx', transactionIdxSchema);

const MAX_TX_LIMIT_PP = 100;

const getTransactions = async params => {
	const transactionsDB = await getTransactionIdx();
	const transactions = {
		data: [],
		meta: {},
	};

	if (!params) params = {};
	if (!params.limit) params.limit = 10;
	if (!params.offset) params.offset = 0;

	if (params.sort
		&& ['nonce', 'timestamp', 'amount'].some(prop => params.sort.includes(prop))) {
		const sortProp = params.sort.split(':')[0];
		const sortOrder = params.sort.split(':')[1];
		params.sort = [{ column: sortProp, order: sortOrder }];
	}
	if (params.fromTimestamp || params.toTimestamp) {
		params.propBetween = {
			property: 'timestamp',
			from: Number(params.fromTimestamp) || 0,
			to: Number(params.toTimestamp) || Math.floor(Date.now() / 1000),
		};
	}

	// TODO: Add search by message

	const resultSet = await transactionsDB.find(params);
	if (resultSet.length) params.ids = resultSet.map(row => row.id);
	// TODO: Remove the check. Send empty response for non-ID based requests
	const response = await coreApi.getTransactions(params);
	if (response.data) transactions.data = response.data; // .map(tx => normalizeTransaction(tx));
	if (response.meta) transactions.meta = response.meta;

	// TODO: Indexed transactions to blockId
	transactions.data = await BluebirdPromise.map(
		transactions.data,
		async transaction => {
			resultSet.filter(tx => {
				if (tx.id === transaction.id) {
					transaction.unixTimestamp = tx.timestamp;
					transaction.height = tx.height;
					transaction.blockId = tx.blockId;
				}
				return tx;
			});
			return transaction;
		},
		{ concurrency: transactions.data.length },
	);

	transactions.meta.total = transactions.meta.count;
	transactions.meta.count = transactions.data.length;
	transactions.meta.offset = params.offset || 0;
	return transactions;
};

signals.get('indexTransactions').add(async blockId => {
	const transactionIdx = await getTransactionIdx();
	const blockResult = await transactionIdx.find({ blockId }, 'id');
	if (blockResult.length > 0) return;

	const transactions = await coreApi.getTransactions({ blockId, limit: MAX_TX_LIMIT_PP });
	const blockIdx = await getBlockIdx();
	const blockRes = await blockIdx.find({ id: blockId }, ['timestamp', 'unixTimestamp']);
	if (blockRes.length !== 1) return;

	const { timestamp, unixTimestamp } = blockRes[0];
	transactions.data.forEach(tx => {
		tx.timestamp = timestamp;
		tx.unixTimestamp = unixTimestamp;
	});
	transactionIdx.upsert(transactions.data);
});

const getPendingTransactions = async params => {
	const pendingTx = await coreApi.getPendingTransactions(params);
	return pendingTx;
};

module.exports = { getTransactions, getPendingTransactions };
