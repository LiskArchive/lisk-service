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
const BluebirdPromise = require('bluebird');

const coreApi = require('./coreApi');
const config = require('../../../../config');
const { indexAccountsbyPublicKey } = require('./accounts');
const { indexVotes } = require('./voters');
const { getIndexedAccountByPublicKey } = require('./helper');
const { indexTransactions } = require('./transactions');
const { getApiClient, parseToJSONCompatObj } = require('../common');
const { knex } = require('../../../database');

const logger = Logger();
const blocksCache = CacheRedis('blocks', config.endpoints.redis);

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
	const publicKeysToIndex = [];
	const blocks = originalBlocks.map(block => {
		const skimmedBlock = {};
		skimmedBlock.id = block.id;
		skimmedBlock.height = block.height;
		skimmedBlock.unixTimestamp = block.timestamp;
		skimmedBlock.generatorPublicKey = block.generatorPublicKey;
		publicKeysToIndex.push(block.generatorPublicKey);
		return skimmedBlock;
	});
	await blocksDB.writeBatch(blocks);
	await indexAccountsbyPublicKey(publicKeysToIndex);
	await indexTransactions(originalBlocks);
	await indexVotes(originalBlocks);
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
	if (response.data) blocks.data = response.data
		.map(block => ({ ...block.header, payload: block.payload }));
	if (response.meta) blocks.meta = response.meta; // TODO: Build meta manually

	blocks.data = await BluebirdPromise.map(
		blocks.data,
		async block => {
			block.generatorPublicKey = block.generatorPublicKey.toString('hex');
			const [res] = await getIndexedAccountByPublicKey(block.generatorPublicKey);
			block.generatorAddress = res && res.address ? res.address : undefined;
			block.generatorUsername = res && res.username ? res.username : undefined;

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

			return normalizeBlock(block);
		},
		{ concurrency: blocks.data.length },
	);

	if (blocks.data.length === 1) indexBlocks(blocks.data);

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

	const highestIndexedHeight = await blocksCache.get('highestIndexedHeight');
	Array(numOfPages).fill().forEach(async (_, pageNum) => {
		const pseudoOffset = to - (MAX_BLOCKS_LIMIT_PP * (pageNum + 1));
		const offset = pseudoOffset > from ? pseudoOffset : from - 1;
		logger.info(`Attempting to cache blocks ${offset + 1}-${offset + MAX_BLOCKS_LIMIT_PP}`);
		// TODO: Revert to standard notation, once getBlocks is fully implemented
		// const blocks = await getBlocks({
		// 	limit: MAX_BLOCKS_LIMIT_PP,
		// 	offset: offset - 1,
		// 	sort: 'height:asc',
		// });
		const blocks = await getBlocks({
			heightRange: { from: offset + 1, to: offset + MAX_BLOCKS_LIMIT_PP },
		});
		await indexBlocks(blocks.data);

		blocks.data = blocks.data.sort((a, b) => a.height - b.height);

		const topHeightFromBatch = (blocks.data.pop()).height;
		const bottomHeightFromBatch = (blocks.data.shift()).height;
		const lowestIndexedHeight = await blocksCache.get('lowestIndexedHeight');
		if (bottomHeightFromBatch < lowestIndexedHeight) await blocksCache.set('lowestIndexedHeight', bottomHeightFromBatch);
		if (topHeightFromBatch > highestIndexedHeight) await blocksCache.set('highestIndexedHeight', topHeightFromBatch);
	});
	logger.info(`Finished building block index (${from}-${to})`);
};

const init = async () => {
	try {
		const genesisHeight = 1;
		const currentHeight = (await coreApi.getNetworkStatus()).data.height;

		const blockIndexLowerRange = config.indexNumOfBlocks > 0
			? currentHeight - config.indexNumOfBlocks : genesisHeight;
		const blockIndexHigherRange = currentHeight;

		const highestIndexedHeight = await blocksCache.get('highestIndexedHeight') || blockIndexLowerRange;

		const lastNumOfBlocks = await blocksCache.get('lastNumOfBlocks');
		if (lastNumOfBlocks !== config.indexNumOfBlocks) {
			logger.info('Configuration has been updated, re-index eveything');
			await blocksCache.set('lastNumOfBlocks', config.indexNumOfBlocks);
			await blocksCache.set('lowestIndexedHeight', genesisHeight);
			await blocksCache.set('highestIndexedHeight', currentHeight);
		}

		await buildIndex(highestIndexedHeight, blockIndexHigherRange);

		const lowestIndexedHeight = await blocksCache.get('lowestIndexedHeight') || genesisHeight;
		if (blockIndexLowerRange < lowestIndexedHeight) {
			// If the indexing is partially built
			await buildIndex(blockIndexLowerRange, lowestIndexedHeight);
		}
	} catch (err) {
		logger.warn('Unable to update block index');
		logger.warn(err.message);
	}
};

setTimeout(init, 5000);

module.exports = {
	getBlocks,
	updateFinalizedHeight,
	getFinalizedHeight,
};
