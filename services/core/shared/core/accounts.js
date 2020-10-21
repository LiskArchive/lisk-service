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
	if (params.limit) result.limit = params.limit;
	if (Number(params.offset) >= 0) result.skip = params.offset;
	return result;
};

const getAccounts = async (params) => {
	const accountDb = await pouchdb('accounts');
	const requestParams = {
		limit: params.limit,
		offset: params.offset,
		sort: params.sort,
		username: params.username,
    };
    let accounts = {
		data: [],
	};

	const inputData = await getSelector({
		...params,
		limit: Number(params.limit) || 10,
		offset: Number(params.offset) || 0,
	});
	const dbResult = await accountDb.find(inputData);
    if (dbResult.length > 0) accounts.data = dbResult;

    if (accounts.data.length === 0) {
        accounts = await coreApi.getAccounts(requestParams);
	if (accounts.data.length > 0) accountDb.writeBatch(accounts.data);
    }
	return accounts;
};

module.exports = {
	getAccounts,
};
