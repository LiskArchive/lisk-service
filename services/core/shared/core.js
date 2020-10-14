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
const {
	TransferTransaction,
	DelegateTransaction,
	MultisignatureTransaction,
	VoteTransaction,
	UnlockTransaction,
	ProofOfMisbehaviorTransaction,
} = require('@liskhq/lisk-transactions');
const { CacheRedis, Logger, LoggerConfig, Utils } = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');
const semver = require('semver');

const recentBlocksCache = require('./recentBlocksCache');
const coreCache = require('./coreCache');
const coreApi = require('./coreApi');
const coreApiCached = require('./coreApiCached');
const { setCoreVersion, getCoreVersion, mapParams } = require('./coreVersionCompatibility');
const config = require('../config.js');

const ObjectUtilService = Utils.Data;
const cacheRedisFees = CacheRedis('fees', config.endpoints.redis);

LoggerConfig(config.log);
const logger = Logger();

const numOfActiveDelegates = 101;
const peerStates = {
	UNKNOWN: 0,
	DISCONNECTED: 1,
	CONNECTED: 2,
};

const calcAvgFeeByteModes = {
	MEDIUM: 'med',
	HIGH: 'high',
};

let readyStatus = false;
let epochUnixTime;
let heightFinalized = 2077908;

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
	const coreVersion = getCoreVersion();
	if (semver.lt(semver.coerce(coreVersion), '3.0.0') && params.type >= 8) params = mapParams(params, url);

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

const getTransactionInstanceByType = transaction => {
	const transactionMap = {
		8: TransferTransaction,
		10: DelegateTransaction,
		12: MultisignatureTransaction,
		13: VoteTransaction,
		14: UnlockTransaction,
		15: ProofOfMisbehaviorTransaction,
	};

	const TransactionClass = transactionMap[transaction.type];
	const tx = new TransactionClass(transaction);
	return tx;
};

const calculateBlockSize = block => {
	let blockSize = 0;
	if (block.numberOfTransactions === 0) return blockSize;

	const payload = block.transactions.data;
	const transactionSizes = payload.map(transaction => {
		const tx = getTransactionInstanceByType(transaction);
		const transactionSize = tx.getBytes().length;
		return transactionSize;
	});

	blockSize = transactionSizes.reduce((a, b) => a + b);
	return blockSize;
};

const calculateWeightedAvg = blocks => {
	const blockSizes = blocks.map(block => calculateBlockSize(block));
	const decayFactor = config.feeEstimates.wavgDecayPercentage / 100;
	let weight = 1;
	const wavgLastBlocks = blockSizes.reduce((a, b) => {
		weight *= 1 - decayFactor;
		return a + (b * weight);
	});

	return wavgLastBlocks;
};

const calculateAvgFeePerByte = (mode, transactionDetails) => {
	const maxBlockSize = 15 * 2 ** 10;
	const allowedModes = Object.values(calcAvgFeeByteModes);

	const lowerPercentile = allowedModes.includes(mode) && mode === calcAvgFeeByteModes.MEDIUM
		? config.feeEstimates.medEstLowerPercentile : config.feeEstimates.highEstLowerPercentile;
	const upperPercentile = allowedModes.includes(mode) && mode === calcAvgFeeByteModes.MEDIUM
		? config.feeEstimates.medEstUpperPercentile : config.feeEstimates.highEstUpperPercentile;
	const lowerBytePos = Math.ceil((lowerPercentile / 100) * maxBlockSize);
	const upperBytePos = Math.floor((upperPercentile / 100) * maxBlockSize);

	let currentBytePos = 0;
	let totalFeePriority = 0;
	transactionDetails.forEach(transaction => {
		if (currentBytePos <= lowerBytePos && lowerBytePos < currentBytePos + transaction.size
			&& currentBytePos + transaction.size <= upperBytePos) {
			totalFeePriority += transaction.feePriority
				* (currentBytePos + transaction.size - lowerBytePos + 1);
		}

		if (lowerBytePos <= currentBytePos && currentBytePos + transaction.size <= upperBytePos) {
			totalFeePriority += transaction.feePriority * transaction.size;
		}

		if (lowerBytePos <= currentBytePos && upperBytePos >= currentBytePos
			&& upperBytePos <= currentBytePos + transaction.size) {
			totalFeePriority += transaction.feePriority * (upperBytePos - currentBytePos + 1);
		}

		currentBytePos += transaction.size;
	});

	const avgFeePriority = totalFeePriority / (upperBytePos - lowerBytePos + 1);
	return avgFeePriority;
};

const calculateFeePerByte = block => {
	const feePerByte = {};
	const payload = block.transactions.data;
	const transactionDetails = payload.map(transaction => {
		const tx = getTransactionInstanceByType(transaction);
		const transactionSize = tx.getBytes().length;
		const { minFee } = tx;
		const feePriority = (Number(transaction.fee) - Number(minFee)) / transactionSize;
		return {
			id: transaction.id,
			size: transactionSize,
			feePriority,
		};
	});
	transactionDetails.sort((t1, t2) => t1.feePriority - t2.feePriority);

	const blockSize = calculateBlockSize(block);

	feePerByte.low = (blockSize < 12.5 * 2 ** 10) ? 0 : transactionDetails[0].feePriority;
	feePerByte.med = calculateAvgFeePerByte(calcAvgFeeByteModes.MEDIUM, transactionDetails);
	feePerByte.high = Math.max(calculateAvgFeePerByte(calcAvgFeeByteModes.HIGH, transactionDetails),
		(1.3 * feePerByte.med + 1));

	return feePerByte;
};

const EMAcalc = (feePerByte, prevFeeEstPerByte) => {
	const calcExpDecay = (emaBatchSize, emaDecayRate) => (
		1 - Math.pow(1 - emaDecayRate, 1 / emaBatchSize)).toFixed(5);

	const alpha = calcExpDecay(config.feeEstimates.emaBatchSize, config.feeEstimates.emaDecayRate);
	logger.info(`Estimating fees with 'α' for EMA set to ${alpha}.`);

	const feeEst = {};
	if (Object.keys(prevFeeEstPerByte).length === 0) prevFeeEstPerByte = { low: 0, med: 0, high: 0 };
	Object.keys(feePerByte).forEach((property) => {
		feeEst[property] = alpha * feePerByte[property] + (1 - alpha) * prevFeeEstPerByte[property];
	});

	const EMAoutput = {
		feeEstLow: feeEst.low,
		feeEstMed: feeEst.med,
		feeEstHigh: feeEst.high,
	};
	return EMAoutput;
};

const getEstimateFeeByteCoreLogic = async (blockBatch, innerPrevFeeEstPerByte) => {
	const wavgBlockBatch = calculateWeightedAvg(blockBatch.data);
	const sizeLastBlock = calculateBlockSize(blockBatch.data[0]);
	const feePerByte = calculateFeePerByte(blockBatch.data[0]);
	const feeEstPerByte = {};

	if (wavgBlockBatch > (12.5 * 2 ** 10) || sizeLastBlock > (14.8 * 2 ** 10)) {
		const EMAoutput = EMAcalc(feePerByte, innerPrevFeeEstPerByte);

		feeEstPerByte.low = EMAoutput.feeEstLow;
		feeEstPerByte.med = EMAoutput.feeEstMed;
		feeEstPerByte.high = EMAoutput.feeEstHigh;
	} else {
		feeEstPerByte.low = 0;
		feeEstPerByte.med = 0;
		feeEstPerByte.high = 0;
	}

	feeEstPerByte.updated = Math.floor(Date.now() / 1000);
	feeEstPerByte.blockHeight = blockBatch.data[0].height;
	feeEstPerByte.blockId = blockBatch.data[0].id;

	return feeEstPerByte;
};

const getEstimateFeeByte = async () => {
	const coreVersion = getCoreVersion();
	if (semver.lt(coreVersion, '3.0.0-beta.1')) {
		return { data: { error: `Action not supported for Lisk Core version: ${coreVersion}.` } };
	}

	const cacheKeyFeeEst = 'lastFeeEstimate';

	const prevFeeEstPerByte = { blockHeight: config.feeEstimates.defaultStartBlockHeight };
	const cachedFeeEstPerByte = await cacheRedisFees.get(cacheKeyFeeEst);
	const latestBlock = await getBlocks({ sort: 'height:desc', limit: 1 });
	if (cachedFeeEstPerByte
		&& ['low', 'med', 'high', 'updated', 'blockHeight', 'blockId']
			.every(key => Object.keys(cachedFeeEstPerByte).includes(key))) {
		if ((Date.now() / 1000) - cachedFeeEstPerByte.updated < 10
			|| Number(latestBlock.data.id) === cachedFeeEstPerByte.blockHeight) {
			return cachedFeeEstPerByte;
		}

		Object.assign(prevFeeEstPerByte, cachedFeeEstPerByte);
	}

	const range = size => Array(size).fill().map((_, index) => index);
	const feeEstPerByte = {};
	const blockBatch = {};
	do {
		/* eslint-disable no-await-in-loop */
		const batchSize = config.feeEstimates.emaBatchSize;
		blockBatch.data = await BluebirdPromise.map(range(batchSize), async i => (await getBlocks({
			height: prevFeeEstPerByte.blockHeight + 1 - i,
		})).data[0], { concurrency: batchSize });

		blockBatch.data = await BluebirdPromise.map(blockBatch.data, async block => Object
			.assign(block, { transactions: await getTransactions({ blockId: block.id }) }),
			{ concurrency: blockBatch.data.length });

		Object.assign(prevFeeEstPerByte,
			await getEstimateFeeByteCoreLogic(blockBatch, prevFeeEstPerByte));

		if (prevFeeEstPerByte.blockHeight !== latestBlock.data[0].height) {
			// Store intermediate values, in case of a long running loop
			await cacheRedisFees.set(cacheKeyFeeEst, prevFeeEstPerByte);
		}
		/* eslint-enable no-await-in-loop */
	} while (latestBlock.data[0].height > prevFeeEstPerByte.blockHeight);

	Object.assign(feeEstPerByte, prevFeeEstPerByte);
	await cacheRedisFees.set(cacheKeyFeeEst, feeEstPerByte);

	return feeEstPerByte;
};

const setFinalizedHeight = height => {
	heightFinalized = height;
};

const getNetworkStatus = async () => {
	const result = await coreApi.getNetworkStatus();
	setFinalizedHeight(result.chainMaxHeightFinalized);
	return result;
};

const getFinalizedHeight = () => heightFinalized;
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
	getNetworkStatus,
	getFinalizedHeight,
	getNetworkConstants: coreApi.getNetworkConstants,
	getTransactions,
	getPeers: coreApi.getPeers,
	numOfActiveDelegates,
	peerStates,
	setReadyStatus,
	setCoreVersion,
	getReadyStatus,
	getUnixTime,
	EMAcalc,
	getEstimateFeeByte,
	getEstimateFeeByteCoreLogic,
	getTransactionInstanceByType,
	calculateBlockSize,
	calculateFeePerByte,
	calcAvgFeeByteModes,
	calculateAvgFeePerByte,
	calculateWeightedAvg,
};
