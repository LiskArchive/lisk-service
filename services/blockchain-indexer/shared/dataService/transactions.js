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
const dataService = require('./business');
const schema = require('../indexer/transactionsSchemas');

const getPendingTransactions = async params => {
	const pendingtransactions = {
		data: [],
		meta: {},
	};

	const response = await dataService.getPendingTransactions(params);
	if (response.data) pendingtransactions.data = response.data;
	if (response.meta) pendingtransactions.meta = response.meta;

	return pendingtransactions;
};

const mergeTransactions = async (params) => {
	const allTransactions = {
		data: [],
		meta: {},
	};

	const transactions = {
		data: [],
		meta: {},
	};

	const pendingTxs = await getPendingTransactions(params);

	// Handle pending txs When call with `transactionId`
	// In case of error from core, returns pendingTxs
	const { offset, limit } = params;
	try {
		// Adjust the `limit` and `offset` as per the response from getPendingTransactions
		const numTotalPendingTx = pendingTxs.meta.total;
		params = {
			...params,
			limit: Math.max(1, limit - (numTotalPendingTx - pendingTxs.data.length)),
			offset: Math.max(0, offset - numTotalPendingTx),
		};

		const response = await dataService.getTransactions(params);
		if (response.data) transactions.data = response.data;
		if (response.meta) transactions.meta = response.meta;
	} catch (error) {
		if (!pendingTxs.data.length) throw error;
	} finally {
		transactions.meta.total = transactions.meta.total || 0;
	}

	allTransactions.data = pendingTxs.data.length === limit
		? pendingTxs.data
		: pendingTxs.data.concat(transactions.data).slice(0, limit);

	allTransactions.meta.count = allTransactions.data.length;
	allTransactions.meta.offset = offset;
	allTransactions.meta.total = pendingTxs.meta.total + transactions.meta.total;

	return allTransactions;
};

const getTransactions = async params => {
	const transactions = {
		data: [],
		meta: {},
	};

	const { includePending, ...remParams } = params;
	params = remParams;

	const response = includePending
		? await mergeTransactions(params)
		: await dataService.getTransactions(params);
	if (response.data) transactions.data = response.data;
	if (response.meta) transactions.meta = response.meta;
	return transactions;
};

const postTransactions = async params => {
	try {
		const response = await dataService.postTransactions(params);
		return {
			message: 'Transaction payload was successfully passed to the network node',
			transactionId: response.transactionId,
		};
	} catch (err) {
		if (err.message.includes('ECONNREFUSED')) return {
			data: { error: 'Unable to reach a network node' },
			status: 'INTERNAL_SERVER_ERROR',
		};

		return {
			data: { error: `Transaction payload was rejected by the network node: ${err.message}` },
			status: 'BAD_REQUEST',
		};
	}
};

const getTransactionsSchemas = async params => {
	const transactionsSchemas = {
		data: [],
		meta: {},
	};

	const response = await schema.getTransactionsSchemas(params);
	if (response.data) transactionsSchemas.data = response.data;
	if (response.meta) transactionsSchemas.meta = response.meta;

	if (!transactionsSchemas.data.length && (params.moduleAssetId || params.moduleAssetName)) {
		const errorMessage = params.moduleAssetId
			? `Schema corresponding moduleAssetId: '${params.moduleAssetId}' not found.`
			: `Schema corresponding moduleAssetName: '${params.moduleAssetName}' not found.`;
		return {
			data: { error: errorMessage },
			status: 'NOT_FOUND',
		};
	}

	return transactionsSchemas;
};

const initPendingTransactionsList = (() => dataService.loadAllPendingTransactions())();

const reload = () => dataService.loadAllPendingTransactions();

module.exports = {
	getTransactions,
	getPendingTransactions,
	initPendingTransactionsList,
	reloadAllPendingTransactions: reload,
	postTransactions,
	getTransactionsSchemas,
};
