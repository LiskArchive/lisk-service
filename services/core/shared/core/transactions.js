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

const config = require('../../config');
const pouchdb = require('../pouchdb');
const requestAll = require('../requestAll');
const coreApi = require('./compat');

const logger = Logger();

const getTransactions = async params => {
	const transactions = {
		data: [],
		meta: {},
	};

	const response = await coreApi.getTransactions(params);
	if (response.data) transactions.data = response.data;
	if (response.meta) transactions.meta = response.meta;

	if (transactions.data.length) {
		const db = await pouchdb(config.db.collections.transactions.name);
		db.writeBatch(transactions.data);
	}
	return transactions;
};

const getPendingTransactions = async params => {
	const pendingTransactions = {
		data: [],
		meta: {},
	};
	const db = await pouchdb(config.db.collections.pending_transactions.name);
	const offset = Number(params.offset) || 0;
	const limit = Number(params.limit) || 10;
	const dbResult = await db.findAll();
	if (dbResult.length) {
		pendingTransactions.data = dbResult.slice(offset, offset + limit);
		pendingTransactions.meta = {
			count: pendingTransactions.data.length,
			offset,
			total: dbResult.length,
		};
	}
	return pendingTransactions;
};

const loadAllPendingTransactions = async () => {
	const db = await pouchdb(config.db.collections.pending_transactions.name);
	const dbResult = await db.findAll();
	const limit = 100;
	const pendingTransactions = await requestAll(coreApi.getPendingTransactions, {}, limit);
	if (pendingTransactions.length) {
		if (dbResult.length) await db.deleteBatch(dbResult);
		await db.writeBatch(pendingTransactions);
		logger.info(`Initialized/Updated pending transactions cache with ${pendingTransactions.length} transactions.`);
	}
};

const initPendingTransactionsList = (() => loadAllPendingTransactions())();

const reload = () => loadAllPendingTransactions();

module.exports = {
	getTransactions,
	getPendingTransactions,
	initPendingTransactionsList,
	reloadAllPendingTransactions: reload,
};
