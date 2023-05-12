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

const { getTableInstance } = require('../database/better-sqlite3');

const cacheBlockSchema = require('../database/schema/blocks');
const cacheTrxIDToBlockIDSchema = require('../database/schema/transactions');

const getBlocksCache = () => getTableInstance(
	cacheBlockSchema.tableName,
	cacheBlockSchema,
);

const getTrxIDtoBlockIDCache = () => getTableInstance(
	cacheTrxIDToBlockIDSchema.tableName,
	cacheTrxIDToBlockIDSchema,
);

const mapTransactionIDstoBlockID = async (transactions, blockID) => {
	const trxIDToBlockIDCache = await getTrxIDtoBlockIDCache();

	await BluebirdPromise.map(
		transactions,
		async transaction => trxIDToBlockIDCache.upsert({ transactionID: transaction.id, blockID }),
		{ concurrency: transactions.length },
	);
};

const cacheBlocks = async (blocks) => {
	const blocksCache = await getBlocksCache();

	const blocksToCache = Array.isArray(blocks) ? blocks : [blocks];

	await BluebirdPromise.map(
		blocksToCache,
		async block => {
			await blocksCache.upsert({ id: block.header.id, block });
			if (block.transactions.length) {
				await mapTransactionIDstoBlockID(block.transactions, block.header.id);
			}
		},
		{ concurrency: blocksToCache.length },
	);
};

const getBlockByIDFromCache = async (id) => {
	const blocksCache = await getBlocksCache();
	const [{ block } = {}] = await blocksCache.find({ id }, ['block']);
	if (!block || Object.keys(block).length === 0) return null;
	const parsedBlock = JSON.parse(block);
	return parsedBlock;
};

const getBlockByIDsFromCache = async (blockIDs) => {
	const blocks = await BluebirdPromise.map(
		blockIDs,
		async blockID => getBlockByIDFromCache(blockID),
		{ concurrency: blockIDs.length },
	);

	return blocks;
};

const getTransactionByIDFromCache = async (transactionID) => {
	const trxIDToBlockIDCache = await getTrxIDtoBlockIDCache();
	const [{ blockID }] = await trxIDToBlockIDCache.find({ transactionID }, ['blockID']);
	if (!blockID) return null;
	const block = await getBlockByIDFromCache(blockID);
	const transaction = block.transactions.find(tx => tx.id === transactionID);
	return transaction;
};

const getTransactionByIDsFromCache = async (transactionIDs) => {
	const transactions = await BluebirdPromise.map(
		transactionIDs,
		async transactionID => getTransactionByIDFromCache(transactionID),
		{ concurrency: transactionIDs.length },
	);

	return transactions;
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

module.exports = {
	cacheBlocks,
	getBlockByIDFromCache,
	getBlockByIDsFromCache,
	getTransactionByIDFromCache,
	getTransactionByIDsFromCache,
	cacheCleanup,
};
