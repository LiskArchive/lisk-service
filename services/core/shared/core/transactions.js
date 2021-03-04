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
const coreApi = require('./compat');

const getPendingTransactions = async params => {
	const pendingtransactions = {
		data: [],
		meta: {},
	};

	const response = await coreApi.getPendingTransactions(params);
	if (response.data) pendingtransactions.data = response.data;
	if (response.meta) pendingtransactions.meta = response.meta;

	return pendingtransactions;
};

const mergeTransactions = async (params) => {
	const allTransactions = {
		data: [],
		meta: {},
	};

	const offset = params.offset || 0;
	const limit = params.limit || 10;

	const pendingTxs = await getPendingTransactions(params);
	delete params.includePending;
	const transactions = await coreApi.getTransactions(params);
	allTransactions.data = pendingTxs.data.concat(transactions.data).slice(offset, offset + limit);

	allTransactions.meta.count = allTransactions.data.length;
	allTransactions.meta.offset = offset;
	allTransactions.meta.total = (transactions.meta.total + pendingTxs.meta.total);

	return allTransactions;
};

const getTransactions = async params => {
	const transactions = {
		data: [],
		meta: {},
	};
	const response = params.includePending
		? await mergeTransactions(params)
		: await coreApi.getTransactions(params);
	if (response.data) transactions.data = response.data;
	if (response.meta) transactions.meta = response.meta;
	return transactions;
};

const postTransactions = async (params) => {
	const response = await coreApi.postTransactions(params);
	return response;
};

const initPendingTransactionsList = (() => coreApi.loadAllPendingTransactions())();

const reload = () => coreApi.loadAllPendingTransactions();

module.exports = {
	getTransactions,
	getPendingTransactions,
	initPendingTransactionsList,
	reloadAllPendingTransactions: reload,
	getTransactionById: coreApi.getTransactionById,
	getTransactionsByBlockId: coreApi.getTransactionsByBlockId,
	postTransactions,
};
