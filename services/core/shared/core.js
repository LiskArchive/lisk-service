/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const { Utils } = require('lisk-service-framework');

const ObjectUtilService = Utils.Data;

const recentBlocksCache = require('./recentBlocksCache');
const coreCache = require('./coreCache');
const coreApi = require('./coreApi');
const coreApiCached = require('./coreApiCached');
const { setProtocolVersion } = require('./coreProtocolCompatibility.js');

const config = require('../config.js');

const numOfActiveDelegates = 101;
const peerStates = {
	UNKNOWN: 0,
	DISCONNECTED: 1,
	CONNECTED: 2,
};

let readyStatus = false;
let epochUnixTime;

// Utils & helpers
const parseAddress = address => {
	if (typeof address !== 'string') return '';
	return address.toUpperCase();
};
const validateAddress = address => (typeof address === 'string' && address.match(/^[0-9]{20}[L|l]$/g));
const validatePublicKey = publicKey => (typeof publicKey === 'string' && publicKey.match(/^([A-Fa-f0-9]{2}){32}$/g));
const { isProperObject } = ObjectUtilService;
const { isEmptyArray } = ObjectUtilService;

// Lisk Core API functions
const getConstants = async () => {
	const expireMiliseconds = Number(config.ttl.stable) * 1000;
	const result = await coreApiCached.getNetworkConstants(null, { expireMiliseconds });
	if (!isProperObject(result)) return {};
	return result.data;
};


const confirmAddress = async address => {
	if (!address || typeof address !== 'string') return false;
	const account = await coreCache.getCachedAccountByAddress(parseAddress(address));
	return (account && account.address === address);
};

const confirmPublicKey = async publicKey => {
	if (!publicKey || typeof publicKey !== 'string') return false;
	const account = await coreCache.getCachedAccountByPublicKey(publicKey);
	return (account && account.publicKey === publicKey);
};

const confirmSecondPublicKey = async secondPublicKey => {
	if (!secondPublicKey || typeof secondPublicKey !== 'string') return false;
	const account = await coreCache.getCachedAccountBySecondPublicKey(secondPublicKey);
	return (account && account.secondPublicKey === secondPublicKey);
};

const confirmUsername = async username => {
	if (!username || typeof username !== 'string') return false;
	const result = await coreApi.getDelegates({ username });
	if (!Array.isArray(result.data) || isEmptyArray(result.data)) return false;
	return (result.data[0].username === username);
};

const confirmAnyId = async params => {
	if (
		(typeof params.username === 'string' && !(await confirmUsername(params.username)))
		|| (typeof params.address === 'string' && !(await confirmAddress(parseAddress(params.address))))
		|| (typeof params.publicKey === 'string' && (!(await confirmPublicKey(params.publicKey))))
		|| (typeof params.secondPublicKey === 'string' && (!(await confirmSecondPublicKey(params.secondPublicKey))))
	) return false;

	return true;
};

const getUsernameByAddress = async address => {
	const account = await coreCache.getCachedAccountByAddress(parseAddress(address));
	return account && account.username;
};

const getAddressByPublicKey = async publicKey => {
	if (!publicKey || typeof publicKey !== 'string') return '';
	const account = await coreCache.getCachedAccountByPublicKey(publicKey);
	return account ? account.address : '';
};

const getAddressByUsername = async username => {
	if (!username || typeof username !== 'string') return '';
	const account = await coreCache.getCachedAccountByUsername(username);
	return account ? account.address : '';
};

const getAddressByAny = async param => {
	const paramNames = {
		'username:': getAddressByUsername,
		'address:': parseAddress,
		'publickey:': getAddressByPublicKey,
	};

	const hasPrefix = p => !!Object.keys(paramNames).filter(item => p.indexOf(item) === 0).length;

	const separateParam = p => Object.keys(paramNames)
		.filter(prefix => p.indexOf(prefix) === 0)
		.reduce((array, prefix) => [...array, prefix, p.slice(prefix.length)], []);

	if (!hasPrefix(param)) {
		const parsedAddress = parseAddress(param);
		if (validateAddress(parsedAddress)
		&& await confirmAddress(parsedAddress)) return parsedAddress;
		if (validatePublicKey(param)) return getAddressByPublicKey(param);
		return getAddressByUsername(param);
	}

	const [prefix, body] = separateParam(param);
	return paramNames[prefix](body);
};

const getAccounts = async params => {
	const reqeustParams = {
		limit: params.limit,
		offset: params.offset,
		sort: params.sort,
		username: params.username,
	};

	if (params.address && typeof params.address === 'string') {
		const parsedAddress = parseAddress(params.address);
		if (!await confirmAddress(parsedAddress)) return {};
		reqeustParams.address = parsedAddress;
	}

	if (params.publicKey && typeof params.publicKey === 'string') {
		if (!validatePublicKey(params.publicKey) || (!await confirmPublicKey(params.publicKey))) {
			return {};
		}
		reqeustParams.publicKey = params.publicKey;
	}

	if (params.secondPublicKey && typeof params.secondPublicKey === 'string') {
		if (!validatePublicKey(params.secondPublicKey)
		|| (!await confirmSecondPublicKey(params.secondPublicKey))) {
			return {};
		}
		reqeustParams.secondPublicKey = params.secondPublicKey;
	}

	const result = coreApi.getAccounts(reqeustParams);
	return result;
};

const getPublicKeyByAddress = async address => {
	if (!address || typeof address !== 'string') return '';
	const account = await getAccounts({ address });
	if (!Array.isArray(account.data) || isEmptyArray(account.data)) return '';
	return account.data[0].publicKey;
};

const getPublicKeyByUsername = async username => {
	if (!username || typeof username !== 'string') return '';
	const account = await getAccounts({ username });
	if (!Array.isArray(account.data) || isEmptyArray(account.data)) return '';
	const { publicKey } = account.data[0];
	return publicKey;
};

const getPublicKeyByAny = async param => {
	if (!param || typeof param !== 'string') return '';
	if (validatePublicKey(param) && await confirmPublicKey(param)) return param;
	if (validateAddress(param)) return getPublicKeyByAddress(param);
	return getPublicKeyByUsername(param);
};

const getNextForgers = async params => {
	const result = await coreApi.getNextForgers(params);
	return isProperObject(result) && Array.isArray(result.data) ? result : [];
};

const getMultisignatureGroups = async address => {
	const result = await coreApi.getMultisignatureGroups(parseAddress(address));
	return isProperObject(result) && Array.isArray(result.data) ? result.data[0] : [];
};

const getMultisignatureMemberships = async address => {
	const result = await coreApi.getMultisignatureMemberships(parseAddress(address));
	return isProperObject(result) && Array.isArray(result.data) ? result.data : [];
};

const getIncomingTxsCount = async address => {
	const result = await coreApi.getTransactions({
		recipientId: parseAddress(address),
		limit: 1,
	});
	if (!isProperObject(result)
	|| !isProperObject(result.meta)
	|| !Number.isInteger(result.meta.count)) {
		throw new Error('Could not retrieve incoming transaction count.');
	}
	return result.meta.count;
};

const getOutgoingTxsCount = async address => {
	const result = await coreApi.getTransactions({
		senderId: parseAddress(address),
		limit: 1,
	});
	if (!isProperObject(result)
		|| !isProperObject(result.meta)
		|| !Number.isInteger(result.meta.count)) {
		throw new Error('Could not retrieve outgoing transaction count.');
	}

	return result.meta.count;
};

const getForgingStats = async address => {
	if (!validateAddress(address)) throw new Error('Missing/Invalid address');
	try {
		const result = await coreApi.getForgingStats(parseAddress(address));
		return { ...result.data, ...result.meta };
	} catch (e) {
		return {};
	}
};

const getEpochUnixTime = async () => {
	const nodeConstants = await coreApi.getNetworkConstants();
	const { epoch } = nodeConstants.data;
	epochUnixTime = new Date(epoch).getTime() / 1000;
	return epochUnixTime;
};

const getUnixTime = async blockchainTime => {
	if (epochUnixTime === undefined) await getEpochUnixTime();
	const unixTime = Number(blockchainTime) + Number(epochUnixTime);
	return unixTime;
};

const getBlockchainTime = async unixTime => {
	if (epochUnixTime === undefined) await getEpochUnixTime();
	const blockchainTime = Number(unixTime) - Number(epochUnixTime);
	return blockchainTime;
};

const validateTimestamp = async timestamp => {
	const minUnixTime = await getUnixTime(0);
	if (!timestamp) return false;
	if (Number(timestamp) < Number(minUnixTime)) return false;
	return true;
};

const getTransactions = async params => {
	if (epochUnixTime === undefined) await getEpochUnixTime();

	await Promise.all(['fromTimestamp', 'toTimestamp'].map(async timestamp => {
		if (await validateTimestamp(params[timestamp])) {
			params[timestamp] = await getBlockchainTime(params[timestamp]);
		}
		return Promise.resolve();
	}));

	const transactions = await recentBlocksCache.getCachedTransactions(params)
    || await coreApi.getTransactions(params);
	let result = [];

	if (transactions.data) {
		result = await Promise.all(transactions.data.map(async o => (Object.assign(o, {
			unixTimestamp: await getUnixTime(o.timestamp),
		}))));
	}

	transactions.data = result;
	return transactions;
};

const getBlocks = async params => {
	if (epochUnixTime === undefined) await getEpochUnixTime();

	await Promise.all(['fromTimestamp', 'toTimestamp'].map(async timestamp => {
		if (await validateTimestamp(params[timestamp])) {
			params[timestamp] = await getBlockchainTime(params[timestamp]);
		}
		return Promise.resolve();
	}));
	const blocks = await recentBlocksCache.getCachedBlocks(params) || await coreApi.getBlocks(params);
	let result = [];

	if (blocks.data) {
		result = await Promise.all(blocks.data.map(async o => (Object.assign(o, {
			unixTimestamp: await getUnixTime(o.timestamp),
		}))));
	}

	blocks.data = result;
	return blocks;
};

const setReadyStatus = status => { readyStatus = status; };
const getReadyStatus = () => readyStatus;

module.exports = {
	get: coreApi.request,
	request: coreApi.request,
	parseAddress,
	validateAddress,
	validatePublicKey,
	confirmAddress,
	confirmPublicKey,
	confirmSecondPublicKey,
	confirmUsername,
	confirmAnyId,
	getAddressByAny,
	getAddressByPublicKey,
	getAddressByUsername,
	getPublicKeyByAny,
	getPublicKeyByAddress,
	getPublicKeyByUsername,
	getUsernameByAddress,
	getAccounts,
	getBlocks,
	getConstants,
	getMultisignatureGroups,
	getMultisignatureMemberships,
	getIncomingTxsCount,
	getOutgoingTxsCount,
	getVotes: coreApi.getVotes,
	getVoters: coreApi.getVoters,
	getDelegates: coreApi.getDelegates,
	getForgingStats,
	getNextForgers,
	getNetworkStatus: coreApi.getNetworkStatus,
	getNetworkConstants: coreApi.getNetworkConstants,
	getTransactions,
	getPeers: coreApi.getPeers,
	numOfActiveDelegates,
	peerStates,
	setReadyStatus,
	setProtocolVersion,
	getReadyStatus,
	getUnixTime,
};
