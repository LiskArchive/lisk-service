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
const { Logger, CacheRedis } = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const config = require('../../config');

const cacheRedisDelegates = CacheRedis('delegates', config.endpoints.redis);

const requestAll = require('../requestAll');
const coreApi = require('./compat');
const { getLastBlock } = require('./blocks');

const logger = Logger();
const sdkVersion = coreApi.getSDKVersion();

let nextForgers = [];
let delegateList = [];

const delegateComparator = (a, b) => {
	const diff = b.delegateWeight - a.delegateWeight;
	if (diff !== 0) return diff;
	return Buffer.from(a.account.address).compare(Buffer.from(b.account.address));
};

const getAllDelegates = () => new Promise((resolve) => {
	resolve(delegateList);
});

const getTotalNumberOfDelegates = async (params = {}) => {
	const allDelegates = await getAllDelegates();
	const relevantDelegates = allDelegates.filter(delegate => (
		(!params.search || delegate.username.includes(params.search))
		&& (!params.username || delegate.username === params.username)
		&& (!params.address || delegate.account.address === params.address)
		&& (!params.publickey || delegate.account.publicKey === params.publickey)
		&& (!params.secpubkey || delegate.account.secondPublicKey === params.secpubkey)
	));
	return relevantDelegates.length;
};

const getRankAndStatus = async allDelegates => {
	const numActiveForgers = 101;

	const delegateStatus = {
		ACTIVE: 'active',
		STANDBY: 'standby',
		BANNED: 'banned',
		PUNISHED: 'punished',
		NON_ELIGIBLE: 'non-eligible',
	};
	const lastestBlock = getLastBlock();
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
	return allDelegates;
};

const getDelegates = async params => {
	const delegates = {
		data: [],
		meta: {},
	};
	const allDelegates = await getAllDelegates();

	delegates.data = allDelegates.filter(
		(acc) => (acc.address && acc.address === params.address)
			|| (acc.publicKey && acc.publicKey === params.publicKey)
			|| (acc.secondPublicKey && acc.secondPublicKey === params.secondPublicKey)
			|| (acc.username && acc.username === params.username),
	);
	if (delegates.data.length === 0) {
		const dbResult = await coreApi.getDelegates(params);
		if (dbResult.data.length) delegates.data = await getRankAndStatus(dbResult.data);
	}
	delegates.meta.count = delegates.data.length;
	delegates.meta.offset = params.offset || 0;
	delegates.meta.total = await getTotalNumberOfDelegates(params);

	return delegates;
};

const loadAllDelegates = async () => {
	const maxCount = 10000;
	delegateList = await requestAll(coreApi.getDelegates, {}, maxCount);
	await BluebirdPromise.map(
		delegateList,
		async delegate => {
			await cacheRedisDelegates.set(delegate.account.address, delegate);
			await cacheRedisDelegates.set(delegate.username, delegate);
			return delegate;
		},
		{ concurrency: delegateList.length },
	);
	if (delegateList.length) {
		logger.info(`Initialized/Updated delegates cache with ${delegateList.length} delegates.`);
	}
};

const computeDelegateRankAndStatus = async () => {
	const result = await getAllDelegates();
	const allDelegates = await getRankAndStatus(result);
	if (allDelegates.length) delegateList = allDelegates;
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
	const maxCount = (sdkVersion < 4) ? 101 : 103;
	const rawNextForgers = await requestAll(coreApi.getNextForgers, { limit: maxCount }, maxCount);

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
