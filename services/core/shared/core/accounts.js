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
	const selector = {};
	const result = {};
	if (params.address) selector.address = params.height;
	if (params.secondPublicKey) selector.secondPublicKey = params.secondPublicKey;
	if (params.publicKey) selector.publicKey = params.publicKey;
	if (params.username) selector.username = params.username;
	result.selector = selector;

	result.sort = [{ balance: 'asc' }];
	if (params.limit) result.limit = params.limit;
	if (Number(params.offset) >= 0) result.skip = params.offset;
	return result;
};

const getAccounts = async (params) => {
	const db = await pouchdb(config.db.collections.accounts.name);

	let accounts = {
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
		if (sortOrder === 'desc') dbResult.sort((a, b) => {
			let compareResult;
			if (Number(a[sortProp]) >= 0 && Number(b[sortProp]) >= 0) {
				compareResult = Number(a[sortProp]) - Number(b[sortProp]);
			} else {
				// Fallback plan (Ideally not required)
				compareResult = a[sortProp].localCompare(b[sortProp]);
			}
			return compareResult;
		});
		// TODO: Update transient properties such as confirmations
		accounts.data = dbResult;
	}

    if (accounts.data.length === 0) {
        accounts = await coreApi.getAccounts(params);
	if (accounts.data.length > 0) accountDb.writeBatch(accounts.data);
    }
	return accounts;
};

module.exports = {
	getAccounts,
};
