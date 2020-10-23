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
const config = require('../../config');
const pouchdb = require('../pouchdb');
const coreApi = require('./compat');
const { getBlocks } = require('./blocks');

const getSelector = (params) => {
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
		result.sort.push('senderId', 'timestamp');
	}
	if (params.recipientId) {
		selector.recipientId = params.recipientId;
		result.sort.push('recipientId', 'timestamp');
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
		if (params.sort) {
			const sortBy = {};
			const sortProp = params.sort.split(':')[0];
			const sortOrder = params.sort.split(':')[1];
			sortBy[sortProp] = sortOrder;
			result.sort.push(sortBy);
		} else {
			result.sort.push({ timestamp: 'desc' });
		}
	} else if (!result.sort.length) delete result.sort;

	return result;
};

const getTransactions = async params => {
	const db = await pouchdb(config.db.collections.transactions.name);

	let transactions = {
		data: [],
	};

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
	}

	if (transactions.data.length === 0) {
		transactions = await coreApi.getTransactions(params);
		if (transactions.data.length > 0) await db.writeBatch(transactions.data);
	}

	return transactions;
};

module.exports = {
	getTransactions,
};
