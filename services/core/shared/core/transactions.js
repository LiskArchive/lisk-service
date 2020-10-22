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

const getSelector = (params) => {
	const result = {};

	const selector = {};
	if (params.id) selector.id = params.id;
	if (params.type) selector.type = params.type;
	if (params.address) selector.address = params.address;
	if (params.sender) selector.sender = params.sender;
	if (params.recipient) selector.recipient = params.recipient;
	if (params.min || params.max) selector.amount = {};
	if (params.min) Object.assign(selector.amount, { $gte: params.min });
	if (params.max) Object.assign(selector.amount, { $lte: params.max });
	if (params.from || params.to) selector.timestamp = {};
	if (params.from) Object.assign(selector.timestamp, { $gte: params.from });
	if (params.to) Object.assign(selector.timestamp, { $lte: params.to });
	if (params.block) selector.block = params.block;
	if (params.height) selector.height = params.height;
	result.selector = selector;

	result.sort = [];
	if (params.sort) {
		const sortBy = {};
		const sortProp = params.sort.split(':')[0];
		sortBy[sortProp] = 'desc';
		result.sort.push(sortBy);
	} else {
		result.sort.push(
			{ timestamp: 'desc' },
			{ amount: 'desc' },
			{ fee: 'desc' },
		);
	}

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
			if (Number(a[sortProp]) >= 0 && Number(b[sortProp]) >= 0) compareResult = Number(a[sortProp]) - Number(b[sortProp]);
			else compareResult = a[sortProp].localCompare(b[sortProp]); // Fallback plan (Not required)
			return compareResult;
		});
		// TODO: Update transient properties such as confirmations
		transactions.data = dbResult;
	}

	if (transactions.data.length === 0) {
		transactions = await coreApi.getTransactions(params);
		if (transactions.data.length > 0) db.writeBatch(transactions.data);
	}

	return transactions;
};

module.exports = {
	getTransactions,
};
