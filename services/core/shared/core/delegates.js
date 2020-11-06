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
const BluebirdPromise = require('bluebird');

const config = require('../../config');
const pouchdb = require('../pouchdb');
const coreApi = require('./compat');
const { getBlocks } = require('./blocks');

const logger = Logger();

let nextForgers = [];

const delegateComparator = (a, b) => {
	const diff = b.delegateWeight - a.delegateWeight;
	if (diff !== 0) return diff;
	return Buffer.from(a.account.address).compare(Buffer.from(b.account.address));
};

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
			else throw new Error('Request Delegates data from Lisk Core');
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

const computeDelegateRankAndStatus = async () => {
	const sdkVersion = coreApi.getSDKVersion().split('sdk_v')[1];
	if (Number(sdkVersion) < 4) return;

	const numActiveForgers = 101;
	const db = await pouchdb(config.db.collections.delegates.name);

	const allDelegates = await db.findAll();
	const lastestBlock = await getBlocks({ limit: 1 });
	const allNextForgersAddressList = nextForgers.map(forger => forger.account.address);
	const activeNextForgersList = allNextForgersAddressList.slice(0, numActiveForgers);

	const verifyIfPunished = delegate => {
		const isPunished = delegate.pomHeights
			.some(pomHeight => pomHeight.start <= lastestBlock.height
				&& lastestBlock.height <= pomHeight.end);
		return isPunished;
	};

	allDelegates.sort(delegateComparator);
	allDelegates.map((delegate, index) => {
		delegate.rank = index + 1;

		if (!delegate.isDelegate) delegate.status = 'non-eligible';
		else if (delegate.isBanned) delegate.status = 'banned';
		else if (verifyIfPunished(delegate)) delegate.status = 'punished';
		else if (activeNextForgersList.includes(delegate.account.address)) delegate.status = 'active';
		else delegate.status = 'standby';

		return delegate;
	});

	if (allDelegates.length) await db.writeBatch(allDelegates);
};

const getNextForgers = async params => {
	let forgers = {
		data: [],
		meta: {},
	};

	try {
		if (nextForgers.length) {
			const offset = params.offset || 0;
			const limit = params.limit || 10;

			forgers.data = nextForgers.slice(offset, offset + limit);

			forgers.meta.count = forgers.data.length;
			forgers.meta.offset = params.offset;
			forgers.meta.total = nextForgers.length;
		} else throw new Error('Request Next Forgers data from Lisk Core');
	} catch (err) {
		logger.debug(err.message);

		forgers = await coreApi.getNextForgers(params);
		forgers.data = await BluebirdPromise.map(
			forgers.data,
			async forger => {
				const forgerDelegateInfo = await getDelegates({ address: forger.address });
				return forgerDelegateInfo.data[0];
			},
			{ concurrency: forgers.data.length });
		forgers.data.sort(delegateComparator);
	}
	return forgers;
};

const loadAllNextForgers = async (forgersList = []) => {
	const limit = 100;
	const response = await getNextForgers({ limit, offset: forgersList.length });
	forgersList = [...forgersList, ...response.data];

	if (response.data.length === limit) loadAllNextForgers(forgersList);
	else {
		computeDelegateRankAndStatus(); // Necessary to immediately update the delegate status
		nextForgers = forgersList; // Update local in-mem cache with latest information
		logger.info(`Initialized/Updated next forgers cache with ${forgersList.length} delegates.`);
	}
};

const reloadNextForgersCache = () => loadAllNextForgers();

const reload = () => {
	loadAllDelegates();
	computeDelegateRankAndStatus();
};

module.exports = {
	reloadDelegateCache: reload,
	getTotalNumberOfDelegates,
	getDelegates,
	reloadNextForgersCache,
	getNextForgers,
};
