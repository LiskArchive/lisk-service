/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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

const coreApi = require('./coreApi');
const config = require('../../../../config');

const { indexTransactions } = require('./transactions');
const { getApiClient, parseToJSONCompatObj } = require('../common');
const { knex } = require('../../../database');

const logger = Logger();
const blocksCache = CacheRedis('blocks_SDKv5', config.endpoints.redis);

let finalizedHeight;

const setFinalizedHeight = (height) => finalizedHeight = height;

const updateFinalizedHeight = async () => {
	const result = await coreApi.getNetworkStatus();
	setFinalizedHeight(result.data.finalizedHeight);
	return result;
};

const getFinalizedHeight = () => finalizedHeight;

const indexBlocks = async originalBlocks => {
	const blocksDB = await knex('blocks');
	const blocks = originalBlocks.map(block => {
		const skimmedBlock = {};
		skimmedBlock.id = block.id;
		skimmedBlock.height = block.height;
		skimmedBlock.unixTimestamp = block.timestamp;
		skimmedBlock.generatorPublicKey = block.generatorPublicKey;

		return skimmedBlock;
	});
	await blocksDB.writeBatch(blocks);
	await indexTransactions(originalBlocks);
};

const normalizeBlock = block => parseToJSONCompatObj(block);

const getBlocks = async params => {
	const apiClient = await getApiClient();
	const blocksDB = await knex('blocks');
	const blocks = {
		data: [],
		meta: {},
	};

	const { blockId } = params;
	delete params.blockId;
	if (blockId) params.id = blockId;

	// TODO: Remove the check when fully implemented. Currently added for cold start bootstrapping.
	if (!params.heightRange
		&& !(Object.getOwnPropertyNames(params).length === 1 && params.limit === 1)) {
		const resultSet = await blocksDB.find(params);
		if (resultSet.length) params.ids = resultSet.map(row => row.id);
	}

	const response = await coreApi.getBlocks(params);
	if (response.data) blocks.data = response.data.map(block => Object
		.assign(normalizeBlock(block.header), { payload: block.payload }));
	if (response.meta) blocks.meta = response.meta; // TODO: Build meta manually


	blocks.data.map(block => {
		// TODO: Update the below params after accounts index is implemented
		block.generatorAddress = null;
		block.generatorUsername = null;

		block.unixTimestamp = block.timestamp;
		block.totalForged = Number(block.reward);
		block.totalBurnt = 0;
		block.totalFee = 0;

		block.payload.forEach(txn => {
			const txnMinFee = Number(apiClient.transaction.computeMinFee(txn));

			block.totalForged += Number(txn.fee);
			block.totalBurnt += txnMinFee;
			block.totalFee += Number(txn.fee) - txnMinFee;
		});
		block.payload = block.payload.map(o => parseToJSONCompatObj(o));
		return block;
	});
	indexBlocks(blocks.data);
	return blocks;
};

const buildIndex = async (from, to) => {
	logger.info('Building index of blocks');

	if (from >= to) {
		logger.warn(`Invalid interval of blocks to index: ${from} -> ${to}`);
		return;
	}

	const MAX_BLOCKS_LIMIT_PP = 100;
	const numOfPages = Math.ceil((to + 1) / MAX_BLOCKS_LIMIT_PP - from / MAX_BLOCKS_LIMIT_PP);

	Array(numOfPages).fill().forEach(async (_, pageNum) => {
		const offset = from + (MAX_BLOCKS_LIMIT_PP * pageNum);
		logger.info(`Attempting to cache blocks ${offset}-${offset + MAX_BLOCKS_LIMIT_PP}`);
		// TODO: Revert to standard notation, once getBlocks is fully implemented
		// const blocks = await getBlocks({
		// 	limit: MAX_BLOCKS_LIMIT_PP,
		// 	offset: offset - 1,
		// 	sort: 'height:asc',
		// });
		const blocks = await getBlocks({
			heightRange: { from: offset, to: offset + MAX_BLOCKS_LIMIT_PP },
		});
		const topHeightFromBatch = (blocks.data.pop()).height;
		await blocksCache.set('lastIndexedHeight', topHeightFromBatch);
	});
	logger.info(`Finished building block index (${from}-${to})`);
};

const init = async () => {
	try {
		const currentHeight = (await coreApi.getNetworkStatus()).data.height;

		let blockIndexLowerRange = config.indexNumOfBlocks > 0
			? currentHeight - config.indexNumOfBlocks : 1;
		const lastNumOfBlocks = await blocksCache.get('lastNumOfBlocks');

		if (Number(lastNumOfBlocks) === Number(config.indexNumOfBlocks)) {
			// Everything seems allright, continue at height where stopped last time
			blockIndexLowerRange = await blocksCache.get('lastIndexedHeight');
		} else {
			logger.info('Configuration has been updated, re-index eveything');
			await blocksCache.set('lastNumOfBlocks', config.indexNumOfBlocks);
			await blocksCache.set('lastIndexedHeight', blockIndexLowerRange);
		}

		await buildIndex(blockIndexLowerRange, currentHeight);
	} catch (err) {
		logger.warn('Unable to update block index');
		logger.warn(err.message);
	}
};

init();

module.exports = {
	getBlocks,
	updateFinalizedHeight,
	getFinalizedHeight,
};
