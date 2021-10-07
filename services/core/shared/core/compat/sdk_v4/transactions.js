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
const { Logger } = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');
const coreApi = require('./coreApi');
const requestAll = require('../../../requestAll');

const Signals = require('../../../signals');

const logger = Logger();

const {
	getTableInstance,
	getDbConnection,
	startDbTransaction,
	commitDbTransaction,
	rollbackDbTransaction,
} = require('../../../indexdb/mysql');
const blockIdxSchema = require('./schema/blocks');
const transactionIdxSchema = require('./schema/transactions');
const { transactionTypes } = require('./mappings');

const getBlockIdx = () => getTableInstance('blockIdx', blockIdxSchema);
const getTransactionIdx = () => getTableInstance('transactionIdx', transactionIdxSchema);

let pendingTransactionsList = [];
const MAX_TRANSACTION_AMOUNT = '9223372036854775807';

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

const getTransactionsByBlockId = async blockId => {
	const transactions = await requestAll(_getTrxFromCore, { blockId });
	return {
		data: transactions,
		meta: {
			offset: 0,
			count: transactions.length,
		},
	};
};

const getTransactions = async params => {
	const transactionIdx = await getTransactionIdx();
	const transactions = {
		data: [],
		meta: {},
	};

	if (!params) params = {};
	if (!params.limit) params.limit = 10;
	if (!params.offset) params.offset = 0;

	if (params.fromTimestamp || params.toTimestamp) {
		const { fromTimestamp, toTimestamp, ...remParams } = params;
		params = remParams;

		if (!params.propBetweens) params.propBetweens = [];
		params.propBetweens.push({
			property: 'unixTimestamp',
			from: Number(fromTimestamp) || 0,
			to: Number(toTimestamp) || Math.floor(Date.now() / 1000),
		});
	}

	if (params.minAmount || params.maxAmount) {
		const { minAmount, maxAmount, ...remParams } = params;
		params = remParams;

		if (!params.propBetweens) params.propBetweens = [];
		params.propBetweens.push({
			property: 'amount',
			from: Number(minAmount) || 0,
			to: Number(maxAmount) || MAX_TRANSACTION_AMOUNT,
		});
	}

	if (params.senderIdOrRecipientId) {
		const { senderIdOrRecipientId, ...remParams } = params;
		params = remParams;

		params.senderId = senderIdOrRecipientId;
		params.orWhere = { recipientId: senderIdOrRecipientId };
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
	transactions.meta.offset = params.offset;
	return transactions;
};

const getPendingTransactionsFromCore = async params => {
	const pendingTx = await coreApi.getPendingTransactions(params);
	return pendingTx;
};

const loadAllPendingTransactions = async () => {
	const limit = 100;
	pendingTransactionsList = await requestAll(getPendingTransactionsFromCore, {}, limit);
	logger.info(`Initialized/Updated pending transactions cache with ${pendingTransactionsList.length} transactions.`);
};

const getPendingTransactions = async params => {
	const pendingTransactions = {
		data: [],
		meta: {},
	};
	const offset = Number(params.offset) || 0;
	const limit = Number(params.limit) || 10;
	if (pendingTransactionsList.length) {
		pendingTransactions.data = pendingTransactionsList.slice(offset, offset + limit);
		pendingTransactions.meta = {
			count: pendingTransactions.data.length,
			offset,
			total: pendingTransactionsList.length,
		};
	}
	return pendingTransactions;
};

const indexTransactionsListener = async (blockId) => {
	const transactionIdx = await getTransactionIdx();
	const connection = await getDbConnection();
	const trx = await startDbTransaction(connection);
	try {
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
		transactionIdx.upsert(transactions.data, trx);
		await commitDbTransaction(trx);
	} catch (error) {
		await rollbackDbTransaction(trx);
		throw error;
	}
};

Signals.get('indexTransactions').add(indexTransactionsListener);

// Initialize the database
const init = async () => { await getTransactionIdx(); };

module.exports = {
	getTransactions,
	getTransactionById,
	getTransactionsByBlockId,
	getPendingTransactions,
	init,
	loadAllPendingTransactions,
};
