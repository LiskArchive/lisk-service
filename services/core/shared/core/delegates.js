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

const formatSortString = sortString => {
	const sortObj = {};
	const sortProp = sortString.split(':')[0];
	const sortOrder = sortString.split(':')[1];
	sortObj[sortProp] = sortOrder;

	return sortObj;
};

const getSelector = (params) => {
	const result = {};
	result.sort = [];

	if (params.limit) result.limit = params.limit;
	if (Number(params.offset) >= 0) result.skip = params.offset;

	const selector = {};
	if (params.address) selector['account.address'] = params.address;
	if (params.publicKey) selector['account.publicKey'] = params.publicKey;
	if (params.secondPublicKey) selector['account.secondPublicKey'] = params.secondPublicKey;
	if (params.username) selector.username = params.username;
	result.selector = selector;

	if (Object.getOwnPropertyNames(result.selector).length === 0) {
		if (params.sort) result.sort.push(formatSortString(params.sort));
		else result.sort.push({ rank: 'asc' });
	} else if (result.sort.length === 0) delete result.sort;

	return result;
};

const getDelegates = async params => {
	const db = await pouchdb(config.db.collections.delegates.name);

	let delegates = {
		data: [],
		meta: {},
	};

	try {
		if (
			!params.address
			&& !params.publicKey
			&& !params.secondPublicKey
			&& !params.username
		) throw new Error('Cannot query the DB without indexed params. Falling back to Lisk Core');
		else {
			const inputData = getSelector({
				...params,
				limit: params.limit || 10,
				offset: params.offset || 0,
			});
			const dbResult = await db.find(inputData);

			if (dbResult.length > 0) delegates.data = dbResult;
			else throw new Error('Request data from Lisk Core');
		}
	} catch (err) {
		logger.debug(err.message);

		delegates = await coreApi.getDelegates(params);
		delegates.data.map(delegate => {
			delegate.id = String(delegate.rank);
			return delegate;
		});
		if (delegates.data && delegates.data.length) await db.writeBatch(delegates.data);
	}

	return delegates;
};

const loadAllDelegates = async (delegateList = []) => {
	const limit = 100;
	const response = await getDelegates({ limit, offset: delegateList.length });
	delegateList = [...delegateList, ...response.data];

	if (response.data.length === limit) loadAllDelegates(delegateList);
	else logger.info(`Initialized/Updated delegates cache with ${delegateList.length} delegates.`);
};

const reload = () => {
	loadAllDelegates();
};

const getTotalNumberOfDelegates = async (params = {}) => {
	const db = await pouchdb(config.db.collections.delegates.name);

	const allDelegates = await db.findAll();
	const relevantDelegates = allDelegates.filter(delegate => (
		(!params.search || delegate.username.includes(params.search))
		&& (!params.username || delegate.username === params.username)
		&& (!params.address || delegate.account.address === params.address)
		&& (!params.publickey || delegate.account.publicKey === params.publickey)
		&& (!params.secpubkey || delegate.account.secondPublicKey === params.secpubkey)
	));
	return relevantDelegates.length;
};

module.exports = {
	reloadDelegateCache: reload,
	getTotalNumberOfDelegates,
	getDelegates,
};
