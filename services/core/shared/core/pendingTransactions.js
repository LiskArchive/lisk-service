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
const moment = require('moment');

const config = require('../../config');
const pouchdb = require('../pouchdb');
const coreApi = require('./compat');

const logger = Logger();

const getPendingTransactions = async (params) => {
	let pendingTransactions = {
		data: [],
		meta: {},
		links: {},
	};

	const db = await pouchdb(config.db.collections.pending_transactions.name);
	let dbResult;

	try {
		dbResult = await db.findAll();
		dbResult.sort((a, b) => a.receivedAt.localeCompare(b.receivedAt)).reverse();

		const now = moment().unix(); // TODO: Check if in secs or millisec
		const lastSubmittedAt = moment(dbResult[0].receivedAt).unix();
		if (dbResult.length && now - lastSubmittedAt < 10) {
			// TODO: Update if .unix() in millisecs
			pendingTransactions.data = dbResult.split(params.offset, params.limit);
			pendingTransactions.meta = {
				count: params.limit,
				offset: params.offset,
				total: dbResult.length,
			};
		} else throw new Error('Request data from Lisk Core');
	} catch (err) {
		logger.debug(err.message);
		pendingTransactions = await coreApi.getPendingTransactions(params);
		if (dbResult.length) await db.deleteBatch(dbResult);
		if (pendingTransactions.data && pendingTransactions.data.length) {
			await db.writeBatch(pendingTransactions.data);
		}
	}
	return pendingTransactions;
};

const loadAllPendingTransactions = async (pendingTransactions = []) => {
	const limit = 100;
	const response = await getPendingTransactions({
		limit,
		offset: pendingTransactions.length,
	});
	pendingTransactions = [...pendingTransactions, ...response.data];

	if (response.data.length === limit) loadAllPendingTransactions(pendingTransactions);
	else logger.debug(
			`Initialized/Updated pending transactions cache with ${pendingTransactions.length} transactions.`,
		);
};

const reload = () => loadAllPendingTransactions();

module.exports = {
	getPendingTransactions,
	reloadAllPendingTransactions: reload,
};
