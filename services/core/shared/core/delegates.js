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
const requestAll = require('../requestAll');
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

const getDelegates = async params => {
	const delegates = {
		data: [],
		meta: {},
	};

	const db = await pouchdb(config.db.collections.delegates.name);

	const inputData = getSelector({
		...params,
		limit: params.limit || 10,
		offset: params.offset || 0,
	});

	if (params.search) {
		const dbResult = await db.findAll();
		if (dbResult.length) delegates.data = dbResult
			.filter(delegate => delegate.username.includes(params.search))
			.slice(inputData.skip, inputData.skip + inputData.limit);
	} else {
		const dbResult = await db.find(inputData);
		if (dbResult.length) delegates.data = dbResult;
	}

	delegates.meta.count = delegates.data.length;
	delegates.meta.offset = inputData.skip;
	delegates.meta.total = await getTotalNumberOfDelegates(params);

	return delegates;
};

const loadAllDelegates = async () => {
	const db = await pouchdb(config.db.collections.delegates.name);

	const maxCount = 10000;
	const rawDelegates = await requestAll(coreApi.getDelegates, {}, maxCount);

	const dbResult = await db.findAll();
	const delegates = await BluebirdPromise.map(
		rawDelegates,
		async delegate => {
			if (dbResult.length) {
				const [dbMatchByAddress] = dbResult
					.filter(dbDelegate => dbDelegate.account.address === delegate.account.address);
				const [dbMatchByRank] = dbResult.filter(dbDelegate => dbDelegate.rank === delegate.rank);

				if (dbMatchByAddress) delegate = dbMatchByAddress.rank === delegate.rank
					? dbMatchByAddress : delegate;

				// If no existing DB match for given delegate address
				// and entry exists for given delegate rank, replace the entry
				if (!delegate._rev && dbMatchByRank) delegate._rev = dbMatchByRank._rev;
			}

			delegate.id = String(delegate.rank);
			return delegate;
		},
		{ concurrency: rawDelegates.length },
	);

	if (delegates.length) {
		await db.writeBatch(delegates);
		logger.info(`Initialized/Updated delegates cache with ${delegates.length} delegates.`);
	}
};

const computeDelegateRankAndStatus = async () => {
	const db = await pouchdb(config.db.collections.delegates.name);
	const sdkVersion = Number(coreApi.getSDKVersion().split('sdk_v')[1]);
	const numActiveForgers = 101;

	const delegateStatus = {
		ACTIVE: 'active',
		STANDBY: 'standby',
		BANNED: 'banned',
		PUNISHED: 'punished',
		NON_ELIGIBLE: 'non-eligible',
	};

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

	if (sdkVersion >= 4) allDelegates.sort(delegateComparator);
	allDelegates.map((delegate, index) => {
		if (sdkVersion < 4) {
			if (activeNextForgersList.includes(delegate.account.address)) {
				delegate.status = delegateStatus.ACTIVE;
			} else delegate.status = delegateStatus.STANDBY;
		} else {
			delegate.rank = index + 1;
			if (!delegate.isDelegate) delegate.status = delegateStatus.NON_ELIGIBLE;
			else if (delegate.isBanned) delegate.status = delegateStatus.BANNED;
			else if (verifyIfPunished(delegate)) delegate.status = delegateStatus.PUNISHED;
			else if (activeNextForgersList.includes(delegate.account.address)) {
				delegate.status = delegateStatus.ACTIVE;
			} else delegate.status = delegateStatus.STANDBY;
		}

		return delegate;
	});

	if (allDelegates.length) await db.writeBatch(allDelegates);
};

const getNextForgers = async params => {
	const forgers = {
		data: [],
		meta: {},
	};

	const offset = params.offset || 0;
	const limit = params.limit || 10;

	forgers.data = nextForgers.slice(offset, offset + limit);

	forgers.meta.count = forgers.data.length;
	forgers.meta.offset = offset;
	forgers.meta.total = nextForgers.length;

	return forgers;
};

const loadAllNextForgers = async () => {
	const maxCount = 103;
	const rawNextForgers = await requestAll(coreApi.getNextForgers, {}, maxCount);

	nextForgers = await BluebirdPromise.map(
		rawNextForgers,
		async forger => (await getDelegates({ address: forger.address })).data[0],
		{ concurrency: rawNextForgers.length });
	nextForgers.sort(delegateComparator);

	await computeDelegateRankAndStatus(); // Necessary to immediately update the delegate status
	nextForgers = await BluebirdPromise.map(
		nextForgers,
		async forger => (await getDelegates({ address: forger.account.address })).data[0],
		{ concurrency: nextForgers.length },
	); // Update local in-mem cache with the updated delegate status information

	logger.info(`Initialized/Updated next forgers cache with ${nextForgers.length} delegates.`);
};

const reloadNextForgersCache = () => loadAllNextForgers();

const reload = async () => {
	await loadAllDelegates();
	await computeDelegateRankAndStatus();
};

module.exports = {
	reloadDelegateCache: reload,
	getTotalNumberOfDelegates,
	getDelegates,
	reloadNextForgersCache,
	getNextForgers,
};
