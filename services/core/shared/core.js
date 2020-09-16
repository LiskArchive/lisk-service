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
const { BaseTransaction } = require('@liskhq/lisk-transactions');
const { CacheRedis, Utils } = require('lisk-service-framework');

const ObjectUtilService = Utils.Data;

const recentBlocksCache = require('./recentBlocksCache');
const coreCache = require('./coreCache');
const coreApi = require('./coreApi');
const coreApiCached = require('./coreApiCached');
const { setProtocolVersion, getProtocolVersion, mapParams } = require('./coreProtocolCompatibility.js');
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
const validateAddress = address => (typeof address === 'string' && address.match(/^[0-9]{1,20}[L|l]$/g));
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

const updateTransactionType = params => {
	let url;
	const transactionTypes = ['transfer', 'registerSecondPassphrase', 'registerDelegate', 'castVotes', 'registerMultisignature'];
	if (params.type === 'registerDelegate') url = '/delegates/latest_registrations';
	params.type = (typeof (params.type) === 'string' && transactionTypes.includes(params.type)) ? params.type.toUpperCase() : params.type;
	params = mapParams(params, url);

	// Check for backward compatibility
	const protocolVersion = Number(getProtocolVersion().charAt(0));
	if (protocolVersion < 2 && params.type >= 8) params = mapParams(params, url);

	return params;
};

const getTransactions = async params => {
	if (epochUnixTime === undefined) await getEpochUnixTime();

	await Promise.all(['fromTimestamp', 'toTimestamp'].map(async timestamp => {
		if (await validateTimestamp(params[timestamp])) {
			params[timestamp] = await getBlockchainTime(params[timestamp]);
		}
		return Promise.resolve();
	}));

	params = updateTransactionType(params);
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

const calculateBlockSize = block => {
	let blockSize = 0;
	if (block.numberOfTransactions === 0) return blockSize;

	const payload = block.transactions.data;
	payload.forEach(transaction => {
		const transactionBytes = new BaseTransaction(transaction).getBytes();
		const transactionSize = Buffer.byteLength(transactionBytes);
		blockSize += transactionSize;
	});

	return blockSize;
};

const calculateWeightedAvg = blocks => {
	const blockSizes = [];

	blocks.forEach(block => blockSizes.push(calculateBlockSize(block)));

	const decayFactor = 0.1;
	let weight = 1;
	const wavgLastBlocks = blockSizes.reduce((a, b) => {
		weight *= 1 - decayFactor;
		return a + (b * weight);
	});

	return wavgLastBlocks;
};

const calulateAvgFeePerByte = (mode, blockSize, transactionDetails) => {
	if (blockSize === 0) return 0;

	const allowedModes = ['med', 'high'];
	const lowerPercentile = mode in allowedModes && mode === 'med' ? 0.25 : 0.80;
	const upperPercentile = mode in allowedModes && mode === 'med' ? 0.75 : 1.00;
	const lowerBytePos = Math.ceil(lowerPercentile * blockSize);
	const upperBytePos = Math.floor(upperPercentile * blockSize);

	let currentPos = 0;
	let totalFeePriority = 0;
	transactionDetails.forEach(transaction => {
		if (currentPos <= lowerBytePos && lowerBytePos < currentPos + transaction.size
			&& currentPos + transaction.size <= upperBytePos) {
			totalFeePriority += transaction.feePriority * (currentPos + transaction.size - lowerBytePos);
		}

		if (lowerBytePos <= currentPos && currentPos + transaction.size <= upperBytePos) {
			totalFeePriority += transaction.feePriority * transaction.size;
		}

		if (lowerBytePos <= currentPos && upperBytePos <= currentPos + transaction.size) {
			totalFeePriority += transaction.feePriority * (upperBytePos - currentPos);
		}

		currentPos += transaction.size;
	});

	const avgFeePriority = totalFeePriority / (upperBytePos - lowerBytePos);
	return avgFeePriority;
};

const calculateFeePerByte = async block => {
	const feePerByte = {};
	const payload = block.transactions.data;
	const transactionDetails = [];
	payload.forEach(transaction => {
		const transactionBytes = new BaseTransaction(transaction).getBytes();
		const transactionSize = Buffer.byteLength(transactionBytes);

		let minFee;
		switch (transaction.type) {
			case 2:
			case 10:
				minFee = 1000000000 + 1000 * transactionSize;
				break;
			// Future ready for dApp registration transactions
			case 5:
			case 13:
				minFee = 2500000000 + 1000 * transactionSize;
				break;
			case 0:
			case 1:
			case 3:
			case 4:
			case 8:
			case 9:
			case 11:
			case 12:
			default:
				minFee = 1000 * transactionSize;
		}
		const feePriority = (transaction.fee - minFee) / transactionSize;
		transactionDetails.push({
			id: transaction.id,
			size: transactionSize,
			feePriority,
		});
	});
	transactionDetails.sort((t1, t2) => t1.feePriority - t2.feePriority);

	const blockSize = calculateBlockSize(block);

	feePerByte.low = (blockSize < 12.5 * 2 ** 10) ? 0 : transactionDetails[0].feePriority;
	feePerByte.med = calulateAvgFeePerByte('med', blockSize, transactionDetails);
	feePerByte.high = Math.max(calulateAvgFeePerByte('high', blockSize, transactionDetails), (1.3 * feePerByte.med + 1));

	return feePerByte;
};

const EMAcalc = async (feePerByte, prevFeeEstPerByte) => {
	// TODO
	const alpha = 0.03406;
	const EMAoutput = {};

	EMAoutput.feeEstLow = alpha * feePerByte.low + (1 - alpha) * prevFeeEstPerByte.low;
	EMAoutput.feeEstMed = alpha * feePerByte.med + (1 - alpha) * prevFeeEstPerByte.med;
	EMAoutput.feeEstHigh = alpha * feePerByte.high + (1 - alpha) * prevFeeEstPerByte.high;

	return EMAoutput;
};

const getEstimateFeeByte = async () => {
	const cacheRedis = CacheRedis('fees', config.endpoints.redis);
	const cacheKey = 'lastFeeEstimate';

	const prevFeeEstPerByte = {};
	const cachedFeeEstPerByte = await cacheRedis.get(cacheKey);
	if (cachedFeeEstPerByte
		&& ['low', 'med', 'high', 'updated', 'blockHeight'].every(key => Object.keys(cachedFeeEstPerByte).includes(key))) {
		// Verify if this approach is correct
		if (Date.now() - cachedFeeEstPerByte.updated <= 10 * 10 ** 3) return cachedFeeEstPerByte;

		const latestBlock = await getBlocks({ sort: 'height:desc', limit: 1 });
		if (Number(latestBlock.data.id) === cachedFeeEstPerByte.blockHeight) return cachedFeeEstPerByte;

		Object.assign(prevFeeEstPerByte, cachedFeeEstPerByte);
	}

	const blockBatch = await getBlocks({ sort: 'height:desc', limit: 20 });
	await Promise.all(blockBatch.data.map(async o => (Object.assign(o, {
		transactions: await getTransactions({ blockId: o.id }),
	}))));

	const wavgBlockBatch = calculateWeightedAvg(blockBatch.data);
	const sizeLastBlock = calculateBlockSize(blockBatch.data[0]);
	const feePerByte = await calculateFeePerByte(blockBatch.data[0]);
	const feeEstPerByte = {};

	if (wavgBlockBatch > (12.5 * 2 ** 10) || sizeLastBlock > (14.8 * 2 ** 10)) {
		const EMAoutput = await EMAcalc(feePerByte, prevFeeEstPerByte);

		feeEstPerByte.low = EMAoutput.feeEstLow;
		feeEstPerByte.med = EMAoutput.feeEstMed;
		feeEstPerByte.high = EMAoutput.feeEstHigh;
	} else {
		feeEstPerByte.low = 0;
		feeEstPerByte.med = 0;
		feeEstPerByte.high = 0;
	}

	feeEstPerByte.updated = Date.now(); // Replace with appropriate method
	feeEstPerByte.blockHeight = blockBatch.data[0].id;

	await cacheRedis.set(cacheKey, feeEstPerByte);

	return feeEstPerByte;
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
	getEstimateFeeByte,
};
