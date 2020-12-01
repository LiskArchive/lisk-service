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
// const db = require('../database');
const pouchdb = require('../database/pouchdb');
const coreApi = require('./compat');

const formatSortString = sortString => {
	const sortObj = {};
	const sortProp = sortString.split(':')[0];
	const sortOrder = sortString.split(':')[1];
	sortObj[sortProp] = sortOrder;

	return sortObj;
};

const getSelector = params => {
	const selector = {};
	const result = { sort: [] };

	if (params.address) {
		selector.address = params.address;
	}
	if (params.secondPublicKey) selector.secondPublicKey = params.secondPublicKey;
	if (params.publicKey) {
		selector.publicKey = params.publicKey;
		result.sort.push('publicKey');
	}
	if (params.username) selector.username = params.username;
	result.selector = selector;

	if (Object.getOwnPropertyNames(result.selector).length === 0) {
		if (params.sort) result.sort.push(formatSortString(params.sort));
		else result.sort.push({ timestamp: 'desc' });
	} else if (result.sort.length === 0) delete result.sort;

	if (params.limit) result.limit = params.limit;
	if (Number(params.offset) >= 0) result.skip = params.offset;
	return result;
};

const getAccounts = async params => {
	const accounts = {
		data: [],
		meta: {},
	};

	// const accountdb = await db(config.db.collections.accounts.name);
	const db = await pouchdb(config.db.collections.accounts.name);

	if (!accounts.data.length) {
		if (
			params.address
			|| params.publicKey
			|| params.secondPublicKey
			|| params.username
		) {
			const inputData = getSelector({
				...params,
				limit: params.limit || 10,
				offset: params.offset || 0,
			});
			const dbResult = await db.find(inputData);
			// let dbResult;
			// if (params.address) {
			// 	dbResult = await accountdb.findById(params.address);
			// } else {
			// 	dbResult = await accountdb.find(inputData);
			// }
			if (dbResult.length > 0) {
				const sortProp = params.sort.split(':')[0];
				const sortOrder = params.sort.split(':')[1];
				if (sortOrder === 'desc') dbResult.sort((a, b) => {
					let compareResult;
					try {
						if (Number(a[sortProp]) >= 0 && Number(b[sortProp]) >= 0) {
							compareResult = Number(a[sortProp]) - Number(b[sortProp]);
						}
					} catch (err) {
						compareResult = a[sortProp].localeCompare(b[sortProp]);
					}
					return compareResult;
				});

				accounts.data = dbResult;
			}
		}
	}
	if (accounts.data.length === 0) {
		const response = await coreApi.getAccounts(params);
		if (response.data) accounts.data = response.data;
		if (response.meta) accounts.meta = response.meta;

		if (accounts.data.length) {
			const allAccounts = accounts.data.map((account) => {
				account.id = account.address;
				return account;
			});
			// await accountdb.writebatch(allAccounts);
			await db.writeBatch(allAccounts);
		}
	}
	return accounts;
};

module.exports = {
	getAccounts,
};
