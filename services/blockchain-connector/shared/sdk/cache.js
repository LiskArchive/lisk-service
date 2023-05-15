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
const moment = require('moment');
const BluebirdPromise = require('bluebird');

const { getNodeInfo } = require('./endpoints_1');

const { getTableInstance } = require('../database/better-sqlite3');
const cacheBlockSchema = require('../database/schema/blocks');
const cacheTrxIDToBlockIDSchema = require('../database/schema/transactions');

const config = require('../../config');

const getBlocksCache = () => getTableInstance(
	cacheBlockSchema.tableName,
	cacheBlockSchema,
);

const getTrxIDtoBlockIDCache = () => getTableInstance(
	cacheTrxIDToBlockIDSchema.tableName,
	cacheTrxIDToBlockIDSchema,
);

const blocksToCache = [];

const cacheBlocksIfEnabled = async (blocks) => {
	if (!config.caching.isBlockCachingEnabled || typeof blocks !== 'object') return;

	const blockList = Array.isArray(blocks) ? blocks : [blocks];
	const networkStatus = await getNodeInfo();

	blockList.forEach(block => {
		// Cache non-finalized blocks only
		if (block.header.height > networkStatus.finalizedHeight) {
			blocksToCache.push(block);
		}
	});
};

const initCacheBlocksProcess = async () => {
	const blocksCache = await getBlocksCache();
	const trxIDToBlockIDCache = await getTrxIDtoBlockIDCache();

	/* eslint-disable no-await-in-loop */
	while (blocksToCache.length) {
		const block = blocksToCache.shift();
		await BluebirdPromise.map(
			block.transactions,
			async transaction => trxIDToBlockIDCache.upsert({
				transactionID: transaction.id, blockID: block.header.id,
			}),
			{ concurrency: 1 },
		);
		await blocksCache.upsert({ id: block.header.id, block });
	}
	/* eslint-enable no-await-in-loop */

	setTimeout(initCacheBlocksProcess, 15 * 1000);
};

const getBlockByIDFromCache = async (id) => {
	const blocksCache = await getBlocksCache();
	const resultSet = await blocksCache.find({ id }, ['block']);
	if (!resultSet.length) return null;

	const [{ block }] = resultSet;
	const parsedBlock = JSON.parse(block);
	return parsedBlock;
};

const getTransactionByIDFromCache = async (transactionID) => {
	const trxIDToBlockIDCache = await getTrxIDtoBlockIDCache();
	const resultSet = await trxIDToBlockIDCache.find({ transactionID }, ['blockID']);
	if (!resultSet.length) return null;

	const [{ blockID }] = resultSet;
	const block = await getBlockByIDFromCache(blockID);
	const transaction = block.transactions.find(tx => tx.id === transactionID);
	return transaction;
};

const cacheCleanup = async (expiryInDays) => {
	const blocksCache = await getBlocksCache();
	const trxIDToBlockIDCache = await getTrxIDtoBlockIDCache();

	const propBetweens = [{
		property: 'timestamp',
		to: moment().subtract(expiryInDays, 'days').unix(),
	}];

	const resultSet = await blocksCache.find({ propBetweens }, 'id');
	const blockIDs = resultSet.map(e => e.id);

	// Cleanup block cache
	await blocksCache.deleteByPrimaryKey(blockIDs);

	// Cleanup transaction cache
	await trxIDToBlockIDCache.delete({
		whereIn: {
			property: 'blockID',
			values: blockIDs,
		},
	});
};

initCacheBlocksProcess();

module.exports = {
	cacheBlocksIfEnabled,
	initCacheBlocksProcess,
	getBlockByIDFromCache,
	getTransactionByIDFromCache,
	cacheCleanup,
};
