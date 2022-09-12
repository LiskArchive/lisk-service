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
const BluebirdPromise = require('bluebird');

const { getTableInstance } = require('../database/better-sqlite3');

const cacheBlockSchema = require('../database/schema/blocks');
const mapTxIDtoBlockIDSchema = require('../database/schema/transactions');

const getBlocksCacheIndex = () => getTableInstance(
	cacheBlockSchema.tableName,
	cacheBlockSchema,
);

const getTxIDtoBlockIDCacheIndex = () => getTableInstance(
	mapTxIDtoBlockIDSchema.tableName,
	mapTxIDtoBlockIDSchema,
);

const mapTransactionIDstoBlockID = async (transactions, blockID) => {
	const txToBlockCache = await getTxIDtoBlockIDCacheIndex();

	await BluebirdPromise.map(
		transactions,
		async transaction => txToBlockCache.upsert({ transactionID: transaction.id, blockID }),
		{ concurrency: transactions.length },
	);
};

const cacheBlocks = async (blocks) => {
	const blocksCache = await getBlocksCacheIndex();

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
	const blocksCache = await getBlocksCacheIndex();
	const [{ block } = {}] = await blocksCache.find({ id }, ['block']);
	if (Object.keys(block).length === 0) return null;
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
	const txToBlockCache = await getTxIDtoBlockIDCacheIndex();
	const [{ blockID }] = await txToBlockCache.find({ transactionID }, ['blockID']);
	if (!blockID) return null;
	const block = await getBlockByIDFromCache(blockID);
	const transaction = block.transactions.find(tx => tx === transactionID);
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

module.exports = {
	cacheBlocks,
	getBlockByIDFromCache,
	getBlockByIDsFromCache,
	getTransactionByIDFromCache,
	getTransactionByIDsFromCache,
};
