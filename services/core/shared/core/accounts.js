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
const coreApi = require('./compat');

const logger = Logger();
let topAccounts = [];

const formatSortString = (sortString) => {
	const sortObj = {};
	const sortProp = sortString.split(':')[0];
	const sortOrder = sortString.split(':')[1];
	sortObj[sortProp] = sortOrder;

	return sortObj;
};

const getSelector = (params) => {
	const selector = {};
	const result = { sort: [] };

	if (params.address) selector.address = params.address;
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

const getTopAccounts = () => new Promise((resolve) => {
		resolve(topAccounts);
	});

const getAccounts = async (params) => {
	const db = await pouchdb(config.db.collections.accounts.name);

	let accounts = {
		data: [],
	};
	// read from cache if available
	const cachedAccounts = await getTopAccounts();
	accounts.data = cachedAccounts.filter(
		(acc) => (acc.address && acc.address === params.address)
			|| (acc.publicKey && acc.publicKey === params.publicKey)
			|| (acc.secondPublicKey && acc.secondPublicKey === params.secondPublicKey)
			|| (acc.username && acc.username === params.username),
	);

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
							compareResult = a[sortProp].localCompare(b[sortProp]);
						}
						return compareResult;
					});

				accounts.data = dbResult;
			}
		}
	}
	if (accounts.data.length === 0) {
		accounts = await coreApi.getAccounts(params);
		if (accounts.data.length > 0) {
			const allAccounts = accounts.data.map((account) => {
				account.id = account.address;
				return account;
			});
			await db.writeBatch(allAccounts);
		}
	}
	return accounts;
};

const retrieveTopAccounts = async (accounts = []) => {
	const limit = config.cacheNumOfAccounts;
	const response = await getAccounts({
		limit: limit > 100 ? 100 : limit,
		offset: accounts.length,
		sort: 'balance:desc',
	});
	accounts = [...accounts, ...response.data];

	if (accounts.length < limit) {
		retrieveTopAccounts(accounts);
	} else {
		topAccounts = accounts;
		logger.info(
			`Initialized/Updated accounts cache with ${topAccounts.length} top accounts.`,
		);
	}
};

module.exports = {
	getAccounts,
	retrieveTopAccounts,
};
