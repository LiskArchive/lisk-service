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

const logger = require('lisk-service-framework').Logger();

const { getNodeInfo } = require('./endpoints_1');

const { getTableInstance } = require('../database/sqlite3');
const cacheBlockSchema = require('../database/schema/blocks');
const cacheTrxIDToBlockIDSchema = require('../database/schema/transactions');

const config = require('../../config');

const getBlocksCache = () => getTableInstance(cacheBlockSchema);
const getTrxIDtoBlockIDCache = () => getTableInstance(cacheTrxIDToBlockIDSchema);

const blockCacheWaitlist = [];

const cacheBlocksIfEnabled = async (blocks) => {
	if (!config.cache.isBlockCachingEnabled || typeof blocks !== 'object') return;

	try {
		const blockList = Array.isArray(blocks) ? blocks : [blocks];
		const networkStatus = await getNodeInfo();

		blockList.forEach(block => {
			// Cache non-finalized blocks only
			if (block.header.height > networkStatus.finalizedHeight) {
				blockCacheWaitlist.push(block);
			}
		});
	} catch (err) {
		logger.trace(`Caching blocks failed due to: \n${err.stack}`);
	}
};

const cacheBlocksFromWaitlist = async () => {
	const blocksCache = await getBlocksCache();
	const trxIDToBlockIDCache = await getTrxIDtoBlockIDCache();

	/* eslint-disable no-await-in-loop */
	while (blockCacheWaitlist.length) {
		const block = blockCacheWaitlist.shift();
		await BluebirdPromise.map(
			block.transactions,
			async transaction => trxIDToBlockIDCache.upsert({
				transactionID: transaction.id, blockID: block.header.id,
			}),
			{ concurrency: 1 },
		);
		await blocksCache.upsert({ id: block.header.id, timestamp: block.header.timestamp, block });
	}
	/* eslint-enable no-await-in-loop */

	setTimeout(cacheBlocksFromWaitlist, 15 * 1000);
};

const getBlockByIDFromCache = async (id) => {
	const blocksCache = await getBlocksCache();
	const resultSet = await blocksCache.find({ id, limit: 1 }, ['block']);
	if (!resultSet.length) return null;

	const [{ block }] = resultSet;
	const parsedBlock = JSON.parse(block);
	return parsedBlock;
};

const getTransactionByIDFromCache = async (transactionID) => {
	const trxIDToBlockIDCache = await getTrxIDtoBlockIDCache();
	const resultSet = await trxIDToBlockIDCache.find({ transactionID, limit: 1 }, ['blockID']);
	if (!resultSet.length) return null;

	const [{ blockID }] = resultSet;
	const block = await getBlockByIDFromCache(blockID);
	if (!block) return null;

	const transaction = block.transactions.find(tx => tx.id === transactionID);
	return transaction;
};

const cacheCleanup = async (expiryInHours) => {
	const blocksCache = await getBlocksCache();
	const trxIDToBlockIDCache = await getTrxIDtoBlockIDCache();

	const propBetweens = [{
		property: 'timestamp',
		to: moment().subtract(expiryInHours, 'hours').unix(),
	}];

	const resultSet = await blocksCache.find({ propBetweens }, 'id');
	const blockIDs = resultSet.map(e => e.id);

	// Cleanup transaction cache
	await trxIDToBlockIDCache.delete({
		whereIn: {
			property: 'blockID',
			values: blockIDs,
		},
	});

	// Cleanup block cache
	await blocksCache.deleteByPrimaryKey(blockIDs);
};

if (config.cache.isBlockCachingEnabled) cacheBlocksFromWaitlist();

module.exports = {
	cacheBlocksIfEnabled,
	cacheBlocksFromWaitlist,
	getBlockByIDFromCache,
	getTransactionByIDFromCache,
	cacheCleanup,
};
