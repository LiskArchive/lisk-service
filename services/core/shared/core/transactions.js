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

	const selector = {};
	if (params.id) selector.id = params.id;
	if (params.type) selector.type = params.type;
	if (params.senderIdOrRecipientId) {
		selector.$or = [
			{ senderId: params.senderIdOrRecipientId },
			{ recipientId: params.senderIdOrRecipientId },
		];
	}
	if (params.senderId) selector.senderId = params.senderId;
	if (params.recipientId) selector.recipientId = params.recipientId;
	if (params.minAmount || params.maxAmount) selector.amount = {};
	if (params.minAmount) Object.assign(selector.amount, { $gte: params.minAmount });
	if (params.maxAmount) Object.assign(selector.amount, { $lte: params.maxAmount });
	if (params.fromTimestamp || params.toTimestamp) selector.timestamp = {};
	if (params.fromTimestamp) Object.assign(selector.timestamp, { $gte: params.fromTimestamp });
	if (params.toTimestamp) Object.assign(selector.timestamp, { $lte: params.toTimestamp });
	if (params.blockId) selector.blockId = params.blockId;
	if (params.height) selector.height = params.height;
	result.selector = selector;

	result.sort = [{ timestamp: 'desc' }];

	if (params.limit) result.limit = params.limit;
	if (Number(params.offset) >= 0) result.skip = params.offset;

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
		const sortProp = params.sort.split(':')[0];
		const sortOrder = params.sort.split(':')[1];
		if (sortOrder === 'asc') dbResult.sort((a, b) => {
			let compareResult;
			if (Number(a[sortProp]) >= 0 && Number(b[sortProp]) >= 0) {
				compareResult = Number(a[sortProp]) - Number(b[sortProp]);
			} else {
				compareResult = a[sortProp].localCompare(b[sortProp]);
			}
			return compareResult;
		});

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
