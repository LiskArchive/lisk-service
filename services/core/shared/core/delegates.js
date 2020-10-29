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
	if (params.address) selector.address = params.address;
	if (params.publicKey) selector.publicKey = params.publicKey;
	if (params.secondPublicKey) selector.secondPublicKey = params.secondPublicKey;
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
			delegate.id = delegate.account.address;
			return delegate;
		});
		if (delegates.data && delegates.data.length) await db.writeBatch(delegates.data);
	}

	return delegates;
};

module.exports = {
	getDelegates,
};
