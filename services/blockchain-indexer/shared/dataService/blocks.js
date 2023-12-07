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
const util = require('util');
const { CacheRedis, Logger } = require('lisk-service-framework');

const logger = Logger();

const business = require('./business');
const { getGenesisHeight } = require('../constants');

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

const getTotalNumberOfBlocks = async () =>
	(await getLastBlock()).height - (await getGenesisHeight()) + 1;

const getBlocksFromServer = async params => {
	const blocks = {
		data: [],
		meta: {},
	};

	if (params.blockID) logger.debug(`Retrieved block with ID ${params.blockID} from the node.`);
	else if (params.height)
		logger.debug(`Retrieved block with height: ${params.height} from the node.`);
	else logger.debug(`Retrieved block with custom search: ${util.inspect(params)} from the node.`);

	const response = await business.getBlocks(params);
	if (response.data) blocks.data = response.data;
	if (response.meta) blocks.meta = response.meta;

	if (blocks.data.length) {
		blocks.data.forEach(block => setLastBlock(block));
	}

	return blocks;
};

const getBlocksTotal = async (params, blocksResponse) => {
	let total;

	if (params.generatorAddress) {
		total = 'total' in blocksResponse.meta ? blocksResponse.meta.total : null;
	} else if (params.blockID || !Number.isNaN(Number(params.height))) {
		total = blocksResponse.data.length;
	} else if (
		(params.height && params.height.includes(':')) ||
		(params.timestamp && params.timestamp.includes(':'))
	) {
		total = blocksResponse.meta.total;
	} else {
		total = (await getTotalNumberOfBlocks()) || blocksResponse.data.length;
	}

	return total;
};

const formatBlock = async (blockInfo, isDeletedBlock = false) => {
	const blocksResponse = {
		data: [],
		meta: {},
	};

	const response = await business.formatBlock(
		{
			header: blockInfo.header || {},
			assets: blockInfo.assets || [],
			transactions: blockInfo.transactions || [],
		},
		isDeletedBlock,
	);
	blocksResponse.data.push(response);

	return {
		data: blocksResponse.data,
		meta: {
			count: blocksResponse.data.length,
			offset: 0,
			total: await getBlocksTotal({}, blocksResponse),
		},
	};
};

const getBlocks = async (params = {}) => {
	const blocksResponse = {
		data: [],
		meta: {},
	};

	const response = await getBlocksFromServer(params);
	if (response.data) blocksResponse.data = response.data;
	if (response.meta) blocksResponse.meta = response.meta;

	return {
		data: blocksResponse.data,
		meta: {
			count: blocksResponse.data.length,
			offset: parseInt(params.offset, 10) || 0,
			total: await getBlocksTotal(params, blocksResponse),
		},
	};
};

const getBlocksAssets = async params => {
	const blocksAssets = {
		data: [],
		meta: {},
	};

	const response = await business.getBlocksAssets(params);
	if (response.data) blocksAssets.data = response.data;
	if (response.meta) blocksAssets.meta = response.meta;

	return blocksAssets;
};

const performLastBlockUpdate = async newBlock => {
	try {
		logger.debug(`Setting last block to height: ${newBlock.height} (id: ${newBlock.id}).`);
		await setLastBlock(newBlock);
	} catch (err) {
		logger.error(`Error occurred when performing last block update:\n${err.stack}`);
	}
};

module.exports = {
	formatBlock,
	getBlocks,
	getBlocksAssets,
	setLastBlock,
	getLastBlock,
	getTotalNumberOfBlocks,
	performLastBlockUpdate,
};
