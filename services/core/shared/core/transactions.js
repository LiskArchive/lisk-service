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
const { getBlocks } = require('./blocks');

const logger = Logger();

const formatSortString = sortString => {
	const sortObj = {};
	const sortProp = sortString.split(':')[0];
	const sortOrder = sortString.split(':')[1];
	sortObj[sortProp] = sortOrder;

	return sortObj;
};

const getSelector = params => {
	const result = {};
	result.sort = [];

	if (params.limit) result.limit = params.limit;
	if (Number(params.offset) >= 0) result.skip = params.offset;

	const selector = {};
	if (params.id) selector.id = params.id;
	if (params.type) selector.type = params.type;
	if (params.senderIdOrRecipientId) {
		selector.$or = [
			{ senderId: params.senderIdOrRecipientId },
			{ recipientId: params.senderIdOrRecipientId },
		];
	}
	if (params.senderId) {
		selector.senderId = params.senderId;
		result.sort.push('senderId', formatSortString(params.sort));
	}
	if (params.recipientId) {
		selector.recipientId = params.recipientId;
		result.sort.push('recipientId', formatSortString(params.sort));
	}
	if (params.minAmount || params.maxAmount) selector.amount = {};
	if (params.minAmount) Object.assign(selector.amount, { $gte: params.minAmount });
	if (params.maxAmount) Object.assign(selector.amount, { $lte: params.maxAmount });
	if (params.fromTimestamp || params.toTimestamp) selector.timestamp = {};
	if (params.fromTimestamp) Object.assign(selector.timestamp, { $gte: params.fromTimestamp });
	if (params.toTimestamp) Object.assign(selector.timestamp, { $lte: params.toTimestamp });
	if (params.blockId) selector.blockId = params.blockId;
	if (params.height) selector.height = params.height;
	result.selector = selector;

	if (Object.getOwnPropertyNames(result.selector).length === 0) {
		if (params.sort) result.sort.push(formatSortString(params.sort));
		else result.sort.push({ timestamp: 'desc' });
	} else if (result.sort.length === 0) delete result.sort;

	return result;
};

const getTransactions = async params => {
	const db = await pouchdb(config.db.collections.transactions.name);

	let transactions = {
		data: [],
	};

	try {
		if (!params.id) throw new Error("No param: 'id'. Falling back to Lisk Core");
		else {
			const inputData = getSelector({
				...params,
				limit: params.limit || 10,
				offset: params.offset || 0,
				});
			const dbResult = await db.find(inputData);
			if (dbResult.length > 0) {
				const latestBlock = (await getBlocks({ limit: 1 })).data[0];
				dbResult.map(tx => {
					tx.confirmations = latestBlock.confirmations + latestBlock.height - tx.height;
					return tx;
				});
				transactions.data = dbResult;
			} else throw new Error('Request data from Lisk Core');
		}
	} catch (err) {
		logger.debug(err.message);

		transactions = await coreApi.getTransactions(params);
		if (transactions.data && transactions.data.length) await db.writeBatch(transactions.data);
	}

	return transactions;
};

const getPendingTransactions = async params => {
	const pendingTransactions = {
		data: [],
		meta: {},
		links: {},
	};

	const db = await pouchdb(config.db.collections.pending_transactions.name);
	const offset = Number(params.offset) || 0;
	const limit = Number(params.limit) || 10;
	const dbResult = await db.findAll();
	if (dbResult.length) {
				pendingTransactions.data = dbResult.slice(offset, limit);
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

const reload = () => loadAllPendingTransactions();

module.exports = {
	getTransactions,
	getPendingTransactions,
	reloadAllPendingTransactions: reload,
};
