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
	getHexAddressFromBase32,
} = require('./accounts');
const { indexVotes } = require('./voters');
const {
	indexTransactions,
	removeTransactionsByBlockIDs,
} = require('./transactions');
const { getApiClient } = require('../common');
const { initializeQueue } = require('../../queue');
const { parseToJSONCompatObj } = require('../../../jsonTools');

const mysqlIndex = require('../../../indexdb/mysql');
const blocksIndexSchema = require('./schema/blocks');

const getBlocksIndex = () => mysqlIndex('blocks', blocksIndexSchema);

const logger = Logger();
const blocksCache = CacheRedis('blocks', config.endpoints.redis);

let finalizedHeight;

const setFinalizedHeight = (height) => finalizedHeight = height;

const getFinalizedHeight = () => finalizedHeight;

const updateFinalizedHeight = async () => {
	const result = await coreApi.getNetworkStatus();
	setFinalizedHeight(result.data.finalizedHeight);
	return result;
};

const indexBlocks = async job => {
	const { blocks } = job.data;
	const blocksDB = await getBlocksIndex();
	const publicKeysToIndex = [];
	blocks.map(block => publicKeysToIndex.push(block.generatorPublicKey));
	await blocksDB.upsert(blocks);
	await indexAccountsbyPublicKey(publicKeysToIndex);
	await indexTransactions(blocks);
	await indexVotes(blocks);
};

const updateBlockIndex = async job => {
	const { blocks } = job.data;
	const blocksDB = await getBlocksIndex();
	await blocksDB.upsert(blocks);
};

const indexBlocksQueue = initializeQueue('indexBlocksQueue', indexBlocks);
const updateBlockIndexQueue = initializeQueue('updateBlockIndexQueue', updateBlockIndex);

const normalizeBlocks = async blocks => {
	const apiClient = await getApiClient();

	const normalizedBlocks = BluebirdPromise.map(
		blocks.map(block => ({ ...block.header, payload: block.payload })),
		async block => {
			const account = await getIndexedAccountInfo({ publicKey: block.generatorPublicKey.toString('hex') });
			block.generatorAddress = account && account.address
				? getHexAddressFromBase32(account.address) : undefined;
			block.generatorUsername = account && account.username ? account.username : undefined;
			block.isFinal = block.height <= getFinalizedHeight();
			block.numberOfTransactions = block.payload.length;

			block.size = 0;
			block.totalForged = Number(block.reward);
			block.totalBurnt = 0;
			block.totalFee = 0;

			block.payload.forEach(txn => {
				txn.size = apiClient.transaction.encode(txn).length;
				txn.minFee = apiClient.transaction.computeMinFee(txn);

				block.size += txn.size;

				const txnMinFee = Number(txn.minFee);
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

const indexNewBlocks = async blocks => {
	const blocksDB = await getBlocksIndex();
	if (blocks.data.length === 1) {
		const [block] = blocks.data;
		const [blockInfo] = await blocksDB.find({ height: block.height });
		if (!blockInfo || (!blockInfo.isFinal && block.isFinal)) {
			// Index if doesn't exist, or update if it isn't set to final
			indexBlocksQueue.add('indexBlocksQueue', { blocks: blocks.data });

			// Update block finality status
			const finalizedBlockHeight = getFinalizedHeight();
			const nonFinalBlocks = await blocksDB.find({ isFinal: false, limit: 1000 });
			updateBlockIndexQueue.add('updateBlockIndexQueue', {
				blocks: nonFinalBlocks
					.filter(b => b.height <= finalizedBlockHeight)
					.map(b => ({ ...b, isFinal: true })),
			});

			if (blockInfo && blockInfo.id !== block.id) {
				// Fork detected

				const [highestIndexedBlock] = await blocksDB.find({ sort: 'height:desc', limit: 1 });
				const blocksToRemove = await blocksDB.find({
					propBetweens: [{
						property: 'height',
						from: block.height + 1,
						to: highestIndexedBlock.height,
					}],
					limit: highestIndexedBlock.height - block.height,
				});
				const blockIDsToRemove = blocksToRemove.map(b => b.id);
				await blocksDB.deleteIds(blockIDsToRemove);

				// Remove transactions in the forked blocks
				await removeTransactionsByBlockIDs(blockIDsToRemove);
			}
		}
		const highestIndexedHeight = await blocksCache.get('highestIndexedHeight');
		if ((blockInfo && blockInfo.id !== block.id) || block.height > highestIndexedHeight) {
			await blocksCache.set('highestIndexedHeight', block.height);
		}
	}
};

const getBlocks = async params => {
	const blocksDB = await getBlocksIndex();
	const blocks = {
		data: [],
		meta: {},
	};

	const requestParams = { ...params };

	if (requestParams.blockId) requestParams.id = requestParams.blockId;
	if (!requestParams.limit) requestParams.limit = 10;
	if (!requestParams.offset) requestParams.offset = 0;
	if (!requestParams.sort) requestParams.sort = 'height:desc';

	let accountInfo;
	if (requestParams.publicKey) accountInfo = { publicKey: requestParams.publicKey };
	if (requestParams.address) accountInfo = await getIndexedAccountInfo({
		address: requestParams.address,
	});
	if (requestParams.username) accountInfo = await getIndexedAccountInfo({
		username: requestParams.username,
	});
	if (accountInfo && accountInfo.publicKey) {
		requestParams.generatorPublicKey = accountInfo.publicKey;
	}

	if (requestParams.height && typeof requestParams.height === 'string' && requestParams.height.includes(':')) {
		const [from, to] = requestParams.height.split(':');
		if (from > to) return new Error('From height cannot be greater than to height');
		if (!requestParams.propBetweens) requestParams.propBetweens = [];
		requestParams.propBetweens.push({
			property: 'height',
			from,
			to,
		});
		delete requestParams.height;
	}

	if (requestParams.timestamp && requestParams.timestamp.includes(':')) {
		const [from, to] = requestParams.timestamp.split(':');
		if (from > to) return new Error('From timestamp cannot be greater than to timestamp');
		if (!requestParams.propBetweens) requestParams.propBetweens = [];
		requestParams.propBetweens.push({
			property: 'timestamp',
			from,
			to,
		});
		delete requestParams.timestamp;
	}

	delete requestParams.blockId;
	delete requestParams.publicKey;
	delete requestParams.address;
	delete requestParams.username;

	if (isQueryFromIndex(requestParams)) {
		const resultSet = await blocksDB.find(requestParams);
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

	indexNewBlocks(blocks);

	blocks.meta = {
		count: blocks.data.length,
		offset: requestParams.offset,
		total: await blocksDB.count(requestParams),
	};

	return blocks;
};

const buildIndex = async (from, to) => {
	logger.info('Building index of blocks');

	if (from > to) {
		logger.warn(`Invalid interval of blocks to index: ${from} -> ${to}`);
		return;
	}

	const MAX_BLOCKS_LIMIT_PP = 100;
	const numOfPages = Math.ceil((to + 1) / MAX_BLOCKS_LIMIT_PP - from / MAX_BLOCKS_LIMIT_PP);

	const highestIndexedHeight = await blocksCache.get('highestIndexedHeight');
	for (let pageNum = 0; pageNum < numOfPages; pageNum++) {
		/* eslint-disable no-await-in-loop */
		const pseudoOffset = to - (MAX_BLOCKS_LIMIT_PP * (pageNum + 1));
		const offset = pseudoOffset > from ? pseudoOffset : from - 1;
		logger.info(`Attempting to cache blocks ${offset + 1}-${offset + MAX_BLOCKS_LIMIT_PP}`);

		let blocks;
		do {
			blocks = await getBlocksByHeightBetween(offset + 1, offset + MAX_BLOCKS_LIMIT_PP);
		} while (!(blocks.length && blocks.every(block => !!block && !!block.height)));

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

const indexMissingBlocks = async (fromHeight, toHeight) => {
	const blocksDB = await getBlocksIndex();
	const propBetweens = [{
		property: 'height',
		from: fromHeight,
		to: toHeight,
	}];
	const indexedBlockCount = await blocksDB.count({ propBetweens });
	if (indexedBlockCount < toHeight) {
		const missingBlocksQueryStatement = `
			SELECT
				(SELECT COALESCE(MAX(b0.height)+1, 1) FROM blocks b0 WHERE b0.height < b1.height) AS 'from',
				(b1.height - 1) AS 'to'
			FROM blocks b1
			WHERE b1.height BETWEEN ${fromHeight} AND ${toHeight}
				AND b1.height != 1
				AND NOT EXISTS (SELECT 1 FROM blocks b2 WHERE b2.height = b1.height - 1)
		`;

		const missingBlocksRanges = await blocksDB.rawQuery(missingBlocksQueryStatement);
		for (let i = 0; i < missingBlocksRanges.length; i++) {
			const { from, to } = missingBlocksRanges[i];

			// eslint-disable-next-line no-await-in-loop
			await buildIndex(from, to);
		}
	}
};

const init = async () => {
	await getBlocksIndex();
	try {
		const genesisHeight = 1;
		const currentHeight = (await coreApi.getNetworkStatus()).data.height;

		const blockIndexLowerRange = config.indexNumOfBlocks > 0
			? currentHeight - config.indexNumOfBlocks : genesisHeight;
		const blockIndexHigherRange = currentHeight;

		// Index genesis block first
		await getBlocks({ height: genesisHeight });

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

		await indexMissingBlocks(genesisHeight, currentHeight);
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
	normalizeBlocks,
};
