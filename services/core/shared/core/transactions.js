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

const requestAll = require('../requestAll');
const coreApi = require('./compat');

const sdkVersion = coreApi.getSDKVersion();

const logger = Logger();

let pendingTransactionsList = [];

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

const getTransactions = async params => {
	const transactions = {
		data: [],
		meta: {},
	};

	const response = await coreApi.getTransactions(params);
	if (response.data) transactions.data = response.data;
	if (response.meta) transactions.meta = response.meta;

	return transactions;
};

const loadAllPendingTransactions = async () => {
	if (sdkVersion <= 4) {
		const limit = 100;
		pendingTransactionsList = await requestAll(coreApi.getPendingTransactions, {}, limit);
	} else {
		pendingTransactionsList = await coreApi.getPendingTransactions();
	}
	logger.info(`Initialized/Updated pending transactions cache with ${pendingTransactionsList.length} transactions.`);
};

const initPendingTransactionsList = (() => loadAllPendingTransactions())();

const reload = () => loadAllPendingTransactions();

module.exports = {
	getTransactions,
	getPendingTransactions,
	initPendingTransactionsList,
	reloadAllPendingTransactions: reload,
	getTransactionById: coreApi.getTransactionById,
	getTransactionsByBlockId: coreApi.getTransactionsByBlockId,
};
