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
const { transactionTypes } = require('./mappings');

const getBlockIdx = () => mysqlIdx('blockIdx', blockIdxSchema);
const getTransactionIdx = () => mysqlIdx('transactionIdx', transactionIdxSchema);

const MAX_TX_LIMIT_PP = 100;

const _getTrxFromCore = async params => {
	const blockIdx = await getBlockIdx();
	const transactions = await coreApi.getTransactions(params);
	if (Object.getOwnPropertyNames(transactions).length) {
		transactions.data = await BluebirdPromise.map(
			transactions.data,
			async transaction => {
				const response = await blockIdx.find(
					{ id: transaction.blockId },
					['timestamp', 'unixTimestamp']);
				if (response.length > 0) {
					transaction.timestamp = response[0].timestamp;
					transaction.unixTimestamp = response[0].unixTimestamp;
				}
				return transaction;
			},
			{ concurrency: transactions.data.length },
		);
	}
	return transactions;
};

const getTransactionById = id => _getTrxFromCore({ id });
const getTransactionByIds = ids => BluebirdPromise.map(
	ids,
	async id => {
		const { data } = await _getTrxFromCore({ id });
		if (Array.isArray(data) && data.length > 0) return data[0];
		return {};
	},
	{ concurrency: 4 },
);
const getTransactionsByBlockId = blockId => _getTrxFromCore({ blockId, limit: MAX_TX_LIMIT_PP });

const getTransactions = async params => {
	const transactionIdx = await getTransactionIdx();
	const transactions = {
		data: [],
		meta: {},
	};

	if (!params) params = {};
	if (!params.limit) params.limit = 10;
	if (!params.offset) params.offset = 0;
	const { offset } = params;

	if (params.fromTimestamp || params.toTimestamp) {
		params.propBetween = {
			property: 'unixTimestamp',
			from: Number(params.fromTimestamp) || 0,
			to: Number(params.toTimestamp) || Math.floor(Date.now() / 1000),
		};
		delete params.fromTimestamp;
		delete params.toTimestamp;
	}

	if (params.senderIdOrRecipientId) {
		params.senderId = params.senderIdOrRecipientId;
		params.orWhere = { recipientId: params.senderIdOrRecipientId };
		delete params.senderIdOrRecipientId;
	}

	if (params.type) {
		if (transactionTypes[params.type]) params.type = transactionTypes[params.type];
	}

	// TODO: Add search by message
	const resultSet = await transactionIdx.find(params);
	const total = await transactionIdx.count(params);

	if (resultSet.length > 0) {
		const trxIds = resultSet.map(row => row.id);
		transactions.data = await getTransactionByIds(trxIds);
	}

	transactions.meta.count = transactions.data.length;
	transactions.meta.total = total;
	transactions.meta.offset = offset;
	return transactions;
};

signals.get('indexTransactions').add(async blockId => {
	const transactionIdx = await getTransactionIdx();
	const blockResult = await transactionIdx.find({ blockId }, 'id');
	if (blockResult.length > 0) return;

	const transactions = await getTransactionsByBlockId(blockId);
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

const init = async () => {
	// Initialize the database
	await getTransactionIdx();
};

module.exports = {
	getTransactions,
	getTransactionById,
	getTransactionsByBlockId,
	getPendingTransactions,
	init,
};
