/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
const { CacheRedis, Logger } = require('lisk-service-framework');
const util = require('util');

const logger = Logger();

const dataService = require('./business');
const { getGenesisHeight } = require('../constants');
const { getNameByAddress } = require('../utils/delegateUtils');

const config = require('../../config');

const LAST_BLOCK_CACHE = 'lastBlock';
const lastBlockCache = CacheRedis(LAST_BLOCK_CACHE, config.endpoints.cache);

const LAST_BLOCK_KEY = 'lastBlock';
const setLastBlock = async block => lastBlockCache.set(LAST_BLOCK_KEY, JSON.stringify(block));

const getLastBlock = async () => {
	const lastBlockString = await lastBlockCache.get(LAST_BLOCK_KEY);
	const lastBlock = lastBlockString ? JSON.parse(lastBlockString) : {};
	return lastBlock;
};

const getTotalNumberOfBlocks = async () => (await getLastBlock()).height
	- (await getGenesisHeight()) + 1;

const getBlocksFromServer = async params => {
	const blocks = {
		data: [],
		meta: {},
	};

	if (params.blockID) logger.debug(`Retrieved block with ID ${params.blockID} from Lisk Core`);
	else if (params.height) logger.debug(`Retrieved block with height: ${params.height} from Lisk Core`);
	else logger.debug(`Retrieved block with custom search: ${util.inspect(params)} from Lisk Core`);

	const response = await dataService.getBlocks(params);
	if (response.data) blocks.data = response.data;
	if (response.meta) blocks.meta = response.meta;

	if (blocks.data.length) {
		blocks.data.forEach(block => setLastBlock(block));
	}

	return blocks;
};

const getBlocks = async (params = {}) => {
	const blocks = {
		data: [],
		meta: {},
	};

	const response = await getBlocksFromServer(params);
	if (response.data) blocks.data = response.data;
	if (response.meta) blocks.meta = response.meta;

	await Promise.all(blocks.data.map(async block => {
		block.generator.name = await getNameByAddress(block.generatorAddress);
		return block;
	}));

	let total;
	if (params.generatorAddress) {
		total = blocks.meta.total || null;
	} else if (params.blockID || !Number.isNaN(Number(params.height))) {
		total = blocks.data.length;
	} else if ((params.height && params.height.includes(':'))
		|| (params.timestamp && params.timestamp.includes(':'))) {
		total = blocks.meta.total;
	} else {
		total = await getTotalNumberOfBlocks();
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

const getBlocksAssets = async params => {
	const blocksAssets = {
		data: [],
		meta: {},
	};

	const response = await dataService.getBlocksAssets(params);
	if (response.data) blocksAssets.data = response.data;
	if (response.meta) blocksAssets.meta = response.meta;

	return blocksAssets;
};

const performLastBlockUpdate = async (newBlock) => {
	try {
		logger.debug(`Setting last block to height: ${newBlock.height} (id: ${newBlock.id})`);
		await setLastBlock(newBlock);
	} catch (err) {
		logger.error(`Error occured when performing last block update:\n${err.stack}`);
	}
};

module.exports = {
	getBlocks,
	getBlocksAssets,
	setLastBlock,
	getLastBlock,
	getTotalNumberOfBlocks,
	performLastBlockUpdate,
};
