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

const logger = Logger();

const pouchdb = require('../pouchdb');
const coreApi = require('./compat');
const config = require('../../config');

const initialBlockPrefetch = 202;

const indexList = [
	'id',
	'generatorPublicKey',
	'generatorAddress',
	'generatorUsername',
	'height',
	'numberOfTransactions',
	'previousBlockId',
	'unixTimestamp',
	'totalAmount',
	'totalFee',
	'isFinal',
	['height', 'isFinal'],
	['generatorPublicKey', 'numberOfTransactions'],
	['generatorAddress', 'numberOfTransactions'],
	['generatorUsername', 'numberOfTransactions'],
	['generatorPublicKey', 'totalAmount'],
	['generatorAddress', 'totalAmount'],
	['generatorUsername', 'totalAmount'],
	['generatorPublicKey', 'unixTimestamp'],
	['generatorAddress', 'unixTimestamp'],
	['generatorUsername', 'unixTimestamp'],
];

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
	if (params.isImmutable) selector.isFinal = params.isImmutable;

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

const getBlocks = async (params = {}) => {
	const blockDb = await pouchdb(config.db.collections.blocks.name, indexList);

	let blocks = {
		data: [],
	};

	if (params.blockId
		|| params.numberOfTransactions
		|| params.isFinal === true
		|| params.isImmutable === true) { // try to get from cache
		const inputData = getSelector({
			...params,
			limit: params.limit || 10,
			offset: params.offset || 0,
		});
		const dbResult = await blockDb.find(inputData);
		if (dbResult.length > 0) {
			blocks.data = dbResult.map((block) => ({
				...block,
				confirmations: (getLastBlock().height) - block.height,
			}));
		}
	}

	if (blocks.data.length === 0) {
		blocks = await coreApi.getBlocks(params);
		if (blocks.data.length > 0) {
			const finalBlocks = blocks.data.filter((block) => block.isImmutable === true);
			pushToDb(blockDb, finalBlocks);
		}
	}

	return blocks;
};

const preloadBlocks = async (n) => {
	let blockId = (getLastBlock()).previousBlockId;
	for (let i = 0; i <= n; i++) {
		// eslint-disable-next-line no-await-in-loop
		blockId = (await getBlocks({ blockId })).data[0].previousBlockId;
	}
};

const removeOrphanedBlocks = async (n) => {
	const blockDb = await pouchdb('blocks', indexList);
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

const initBlocks = async () => {
	await pouchdb('blocks', indexList);
	const block = await getBlocks({ limit: 1, sort: 'height:desc' });
	logger.debug('Storing the first block');
	setLastBlock(block.data[0]);

	const numOfBlocksPrefetch = config.cacheNumOfBlocks;

	logger.debug(`Preloading first ${initialBlockPrefetch} blocks`);
	await preloadBlocks(initialBlockPrefetch);
	await removeOrphanedBlocks(initialBlockPrefetch);

	logger.debug(`Preloading ${numOfBlocksPrefetch} blocks in the background...`);
	preloadBlocks(numOfBlocksPrefetch);
};

module.exports = {
	getBlocks,
	preloadBlocks,
	setLastBlock,
	getLastBlock,
	initBlocks,
	removeOrphanedBlocks,
};
