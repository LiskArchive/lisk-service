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
const semver = require('semver');
const pouchdb = require('../pouchdb');
const coreApi = require('./compat');

const { getCoreVersion, mapParams } = require('./compat/sdk_v2/coreVersionCompatibility');

const getSelector = (params) => {
	const result = {};

	const selector = {};
	if (params.id) selector.id = params.id;
	if (params.type) selector.type = params.type;
	if (params.address) selector.address = params.address;
	if (params.sender) selector.sender = params.sender;
	if (params.recipient) selector.recipient = params.recipient;
	// if (params.min) selector.min = params.recipient;
	// if (params.max) selector.max = params.recipient;
	if (params.from || params.to) selector.timestamp = {};
	if (params.from) Object.assign(selector.timestamp, { $gte: params.from });
	if (params.to) Object.assign(selector.timestamp, { $lte: params.to });
	if (params.block) selector.block = params.block;
	if (params.height) selector.height = params.height;
	// if (params.sort) selector.height = params.height;
	result.selector = selector;

	if (params.limit) result.limit = params.limit;
	if (Number(params.offset) >= 0) result.skip = params.offset;

	return result;
};

const getTransactions = async params => {
	const db = await pouchdb('transactions');

	let transactions = {
		data: [],
	};

	if (transactions.data.length === 0) {
		transactions = await coreApi.getTransactions(params);
		if (transactions.data.length > 0) db.writeBatch(transactions.data);
	}

	return transactions;
};

module.exports = {
	getTransactions,
};
