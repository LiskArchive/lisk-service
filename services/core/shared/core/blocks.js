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
const util = require('util');

const logger = Logger();

const pouchdb = require('../pouchdb');
const coreApi = require('./compat');
const config = require('../../config');
const { getUsernameByAddress } = require('./delegateUtils');

let lastBlock = {};

const getSelector = (params) => {
	const result = {};
	const selector = {};
	if (params.height) selector.height = Number(params.height);
	if (params.blockId) selector.id = String(params.blockId);
	if (params.fromTimestamp) selector.unixTimestamp = { $gte: Number(params.fromTimestamp) };
	if (params.toTimestamp) selector.unixTimestamp = { $lte: Number(params.toTimestamp) };
	if (params.generatorPublicKey) selector.generatorPublicKey = String(params.generatorPublicKey);

	if (params.limit) result.limit = Number(params.limit);
	if (Number(params.offset) >= 0) result.skip = Number(params.offset);

	// Not supported by the API but useful for caching
	if (params.numberOfTransactions) selector.numberOfTransactions = {
		$gte: Number(params.numberOfTransactions),
	};
	if (params.isFinal) selector.isFinal = params.isFinal;
	if (params.isImmutable) selector.isImmutable = params.isImmutable;

	result.selector = selector;

	if (params.limit) result.limit = params.limit;
	if (Number(params.offset) >= 0) result.skip = params.offset;

	return result;
};

const pushToDb = async (blockDb, blocks) => {
	const propList = [
		'blockSignature',
		'generatorAddress',
		'generatorPublicKey',
		'height',
		'id',
		'numberOfTransactions',
		'payloadHash',
		'payloadLength',
		'previousBlockId',
		'reward',
		'totalAmount',
		'totalFee',
		'totalForged',
		'unixTimestamp',
		'version',
		'isFinal',
	];
	const out = blocks.map(o => {
		const obj = {};
		propList.map(prop => obj[prop] = o[prop]);
		return obj;
	});
	return blockDb.writeBatch(out);
};

const setLastBlock = block => lastBlock = block;
const getLastBlock = () => lastBlock;

const getBlocksFromCache = async params => {
	const blockDb = await pouchdb(config.db.collections.blocks.name);

	const inputData = getSelector({
		...params,
		limit: params.limit || 10,
		offset: params.offset || 0,
	});

	const dbResult = await blockDb.find(inputData);

	if (dbResult.length > 0) {
		const blocks = dbResult.map((block) => ({
			...block,
			confirmations: (getLastBlock().height) - block.height + (getLastBlock().confirmations),
		}));

		return blocks;
	}

	return [];
};

const getBlocksFromServer = async params => {
	const blocks = {
		data: [],
		meta: {},
	};

	if (params.blockId) logger.debug(`Retrieved block with id ${params.blockId} from Lisk Core`);
	else if (params.height) logger.debug(`Retrieved block with height: ${params.height} from Lisk Core`);
	else logger.debug(`Retrieved block with custom search: ${util.inspect(params)} from Lisk Core`);

	const response = await coreApi.getBlocks(params);
	if (response.data) blocks.data = response.data;
	if (response.meta) blocks.meta = response.meta;

	if (blocks.data.length) {
		const blockDb = await pouchdb(config.db.collections.blocks.name);
		const finalBlocks = blocks.data;
		pushToDb(blockDb, finalBlocks);
	}

	return blocks;
};

const getBlocks = async (params = {}, skipCache = false) => {
	let blocks = {
		data: [],
		meta: {},
	};

	if (skipCache !== true && (params.blockId
		|| params.height
		|| params.isFinal === true
		|| params.isImmutable === true)) { // try to get from cache
		blocks.data = await getBlocksFromCache(params);
	}

	if (blocks.data.length === 0) {
		blocks = await getBlocksFromServer(params);
	}

	await Promise.all(blocks.data.map(async block => {
		block.generatorUsername = await getUsernameByAddress(block.generatorAddress);
		return block;
	}));

	let total;
	if (params.generatorPublicKey) {
		delete blocks.meta.total;
	} else if (params.blockId || params.height) {
		total = blocks.length;
	} else {
		total = (getLastBlock()).height;
	}

	if (coreApi.getFinalizedHeight) {
		const finalHeight = coreApi.getFinalizedHeight();
		const data = blocks.data.map((block) => Object.assign(block,
			{ isFinal: block.height <= finalHeight },
		));
		blocks.data = data;
	}

	return {
		data: blocks.data,
		meta: {
			count: blocks.data.length,
			offset: parseInt(params.offset, 10) || 0,
			total,
		},
	};
};

const preloadBlocksOneByOne = async (n) => {
	let blockId = (getLastBlock()).previousBlockId;
	for (let i = 0; i <= n; i++) {
		// eslint-disable-next-line no-await-in-loop
		blockId = (await getBlocks({ blockId }, true)).data[0].previousBlockId;
	}
};

const preloadBlocksByPage = async (n) => {
	const pageSize = 100;
	const numberOfPages = Math.ceil(n / pageSize);

	const limit = 100;
	for (let i = 0; i <= numberOfPages; i++) {
		// eslint-disable-next-line no-await-in-loop
		await getBlocks({ sort: 'height:desc', offset: (i * limit) + 1, limit }, true);
	}
};

const cleanFromForks = async (n) => {
	const blockDb = await pouchdb(config.db.collections.blocks.name);
	const blocks = await blockDb.find({
		selector: {
			height: { $gte: (getLastBlock()).height - n },
		},
		sort: ['height'],
	});
	const orphanList = blocks.reverse().filter((block, idx) => {
		if (idx + 1 >= blocks.length) return false;
		const prevBlock = blocks[idx + 1];
		if (prevBlock.id !== block.previousBlockId) return true;
		return false;
	});

	// TODO: orphanList removal from PouchDB

	logger.debug(`Found ${orphanList.length} orphaned blocks...`);
	return orphanList;
};

const reloadBlocks = async (n) => preloadBlocksByPage(n);

const initBlocks = (async () => {
	await coreApi.updateFinalizedHeight();
	await pouchdb(config.db.collections.blocks.name);
	const block = await getBlocks({ limit: 1, sort: 'height:desc' });
	logger.debug('Storing the first block');
	setLastBlock(block.data[0]);

	const numOfBlocksPrefetch = config.cacheNumOfBlocks;
	logger.debug(`Preloading first ${numOfBlocksPrefetch} blocks`);
	await reloadBlocks(numOfBlocksPrefetch);
	logger.debug('Finished block prefetch');
})();

module.exports = {
	getBlocks,
	preloadBlocksOneByOne,
	preloadBlocksByPage,
	setLastBlock,
	getLastBlock,
	initBlocks,
	cleanFromForks,
	reloadBlocks,
};
