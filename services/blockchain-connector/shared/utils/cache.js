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

const {
	CacheLRU,
} = require('lisk-service-framework');

const BLOCKS_CACHE = 'cache_blocks';
const TX_TO_BLOCK_ID_MAP = 'mapTransactionIDToBlockID';

const blocksCache = CacheLRU(BLOCKS_CACHE, { max: 250 });
const txToBlockCache = CacheLRU(TX_TO_BLOCK_ID_MAP, { max: 3000 });

const mapTransactionIDstoBlockID = async (transactions, blockID) => BluebirdPromise.map(
	transactions,
	async transaction => txToBlockCache.set(transaction.id, blockID),
	{ concurrency: transactions.length },
);

const cacheBlocks = async (blocks) => {
	const blocksToCache = Array.isArray(blocks) ? blocks : [blocks];

	await BluebirdPromise.map(
		blocksToCache,
		async block => {
			await blocksCache.set(block.header.id, JSON.stringify(block));
			await mapTransactionIDstoBlockID(block.transactions, block.header.id);
		},
		{ concurrency: blocksToCache.length },
	);
};

const getBlockByIDFromCache = async (blockID) => {
	const block = await blocksCache.get(blockID);
	const parsedBlock = JSON.parse(block);
	return parsedBlock;
};

const getBlockByIDsFromCache = async (ids) => {
	const blockIDs = Array.isArray(ids) ? ids : [ids];

	await BluebirdPromise.map(
		blockIDs,
		async blockID => getBlockByIDFromCache(blockID),
		{ concurrency: blockIDs.length },
	);
};

module.exports = {
	cacheBlocks,
	getBlockByIDFromCache,
	getBlockByIDsFromCache,
};
