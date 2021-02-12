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

const {
	indexAccountsbyPublicKey,
	getIndexedAccountInfo,
} = require('./accounts');
const { indexVotes } = require('./voters');
const { indexTransactions } = require('./transactions');
const { getApiClient, parseToJSONCompatObj } = require('../common');
const { initializeQueue } = require('../../queue');

const mysqlIndex = require('../../../indexdb/mysql');
const blocksIndexSchema = require('./schema/blocks');

const getBlocksIndex = () => mysqlIndex('blocks', blocksIndexSchema);

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

const indexBlocks = async job => {
	const { blocks } = job.data;
	const blocksDB = await getBlocksIndex();
	const publicKeysToIndex = [];
	const skimmedBlocks = blocks.map(block => {
		const skimmedBlock = {};
		skimmedBlock.id = block.id;
		skimmedBlock.height = block.height;
		skimmedBlock.timestamp = block.timestamp;
		skimmedBlock.generatorPublicKey = block.generatorPublicKey;
		publicKeysToIndex.push(block.generatorPublicKey);
		return skimmedBlock;
	});
	await blocksDB.upsert(skimmedBlocks);
	await indexAccountsbyPublicKey(publicKeysToIndex);
	await indexTransactions(blocks);
	await indexVotes(blocks);
};

const indexBlocksQueue = initializeQueue('indexBlocksQueue', indexBlocks);

const normalizeBlocks = async blocks => {
	const apiClient = await getApiClient();

	const normalizedBlocks = BluebirdPromise.map(
		blocks.map(block => ({ ...block.header, payload: block.payload })),
		async block => {
			const account = await getIndexedAccountInfo({ publicKey: block.generatorPublicKey.toString('hex') });
			block.generatorAddress = account && account.address ? account.address : undefined;
			block.generatorUsername = account && account.username ? account.username : undefined;

			block.totalForged = Number(block.reward);
			block.totalBurnt = 0;
			block.totalFee = 0;

			block.payload.forEach(txn => {
				const txnMinFee = Number(apiClient.transaction.computeMinFee(txn));

				block.totalForged += Number(txn.fee);
				block.totalBurnt += txnMinFee;
				block.totalFee += Number(txn.fee) - txnMinFee;
			});

			return parseToJSONCompatObj(block);
		},
		{ concurrency: blocks.length },
	);

	return normalizedBlocks;
};

const getBlockByID = async id => {
	const response = await coreApi.getBlockByID(id);
	return normalizeBlocks(response.data);
};

const getBlocksByIDs = async ids => {
	const response = await coreApi.getBlocksByIDs(ids);
	return normalizeBlocks(response.data);
};

const getBlockByHeight = async height => {
	const response = await coreApi.getBlockByHeight(height);
	return normalizeBlocks(response.data);
};

const getBlocksByHeightBetween = async (from, to) => {
	const response = await coreApi.getBlocksByHeightBetween(from, to);
	return normalizeBlocks(response.data);
};

const getLastBlock = async () => {
	const response = await coreApi.getLastBlock();
	return normalizeBlocks(response.data);
};

const isQueryFromIndex = params => {
	const paramProps = Object.getOwnPropertyNames(params);

	const isDirectQuery = ['id', 'height', 'heightBetween'].some(prop => paramProps.includes(prop));

	const sortOrder = params.sort ? params.sort.split(':')[1] : undefined;
	const isLatestBlockFetch = (paramProps.length === 3 && params.limit === 1 && params.offset === 0 && sortOrder === 'desc');

	return !isDirectQuery && !isLatestBlockFetch;
};

const getBlocks = async params => {
	const blocksDB = await getBlocksIndex();
	const blocks = {
		data: [],
		meta: {},
	};

	if (params.blockId) params.id = params.blockId;
	if (!params.limit) params.limit = 10;
	if (!params.offset) params.offset = 0;
	if (!params.sort) params.sort = 'height:desc';

	let accountInfo;
	if (params.publicKey) accountInfo = { publicKey: params.publicKey };
	if (params.address) accountInfo = await getIndexedAccountInfo({ address: params.address });
	if (params.username) accountInfo = await getIndexedAccountInfo({ username: params.username });
	if (accountInfo && accountInfo.publicKey) params.generatorPublicKey = accountInfo.publicKey;

	if (params.height && params.height.includes(':')) {
		const [from, to] = params.height.split(':');
		if (from > to) return new Error('From height cannot be greater than to height');
		if (!params.propBetweens) params.propBetweens = [];
		params.propBetweens.push({
			property: 'height',
			from,
			to,
		});
		delete params.height;
	}

	if (params.timestamp && params.timestamp.includes(':')) {
		const [from, to] = params.timestamp.split(':');
		if (from > to) return new Error('From timestamp cannot be greater than to timestamp');
		if (!params.propBetweens) params.propBetweens = [];
		params.propBetweens.push({
			property: 'timestamp',
			from,
			to,
		});
		delete params.timestamp;
	}

	delete params.blockId;
	delete params.publicKey;
	delete params.address;
	delete params.username;

	if (isQueryFromIndex(params)) {
		const resultSet = await blocksDB.find(params);
		if (resultSet.length) params.ids = resultSet.map(row => row.id);
	}

	if (params.id) {
		blocks.data = await getBlockByID(params.id);
	} else if (params.ids) {
		blocks.data = await getBlocksByIDs(params.ids);
	} else if (params.height) {
		blocks.data = await getBlockByHeight(params.height);
	} else if (params.heightBetween) {
		const { from, to } = params.heightBetween;
		blocks.data = await getBlocksByHeightBetween(from, to);
		if (params.sort) {
			const [sortProp, sortOrder] = params.sort.split(':');
			blocks.data = blocks.data.sort(
				(a, b) => sortOrder === 'asc' ? a[sortProp] - b[sortProp] : b[sortProp] - a[sortProp],
			);
		}
	} else {
		blocks.data = await getLastBlock();
	}

	if (blocks.data.length === 1) indexBlocksQueue.add('indexBlocksQueue', { blocks: blocks.data });

	blocks.meta = {
		count: blocks.data.length,
		offset: params.offset,
		total: 0,
		// TODO: Merge 'Fix transaction endpoint pagination and address param #340' for total/offset
	};

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
	for (let pageNum = 0; pageNum < numOfPages; pageNum++) {
		const pseudoOffset = to - (MAX_BLOCKS_LIMIT_PP * (pageNum + 1));
		const offset = pseudoOffset > from ? pseudoOffset : from - 1;
		logger.info(`Attempting to cache blocks ${offset + 1}-${offset + MAX_BLOCKS_LIMIT_PP}`);

		/* eslint-disable no-await-in-loop */
		// TODO: Add check when below call fails similar to SDKv4
		const blocks = await getBlocksByHeightBetween(offset + 1, offset + MAX_BLOCKS_LIMIT_PP);

		await indexBlocksQueue.add('indexBlocksQueue', { blocks });

		const sortedBlocks = blocks.sort((a, b) => a.height - b.height);

		const topHeightFromBatch = (sortedBlocks.pop()).height;
		const bottomHeightFromBatch = (sortedBlocks.shift()).height;
		const lowestIndexedHeight = await blocksCache.get('lowestIndexedHeight');
		if (bottomHeightFromBatch < lowestIndexedHeight || lowestIndexedHeight === 0) await blocksCache.set('lowestIndexedHeight', bottomHeightFromBatch);
		if (topHeightFromBatch > highestIndexedHeight) await blocksCache.set('highestIndexedHeight', topHeightFromBatch);
		/* eslint-enable no-await-in-loop */
	}
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
			await blocksCache.set('lowestIndexedHeight', 0);
			await blocksCache.set('highestIndexedHeight', currentHeight);
		}

		await buildIndex(highestIndexedHeight, blockIndexHigherRange);

		const lowestIndexedHeight = await blocksCache.get('lowestIndexedHeight');
		if (blockIndexLowerRange < lowestIndexedHeight) {
			// For when the index is partially built
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
