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

const config = require('../../config');

const BLOCKS_CACHE = 'cache_blocks';
const TX_TO_BLOCK_ID_MAP = 'mapTransactionIDToBlockID';

const blocksCache = CacheLRU(BLOCKS_CACHE, config.endpoints.cache);
const txToBlockCache = CacheLRU(TX_TO_BLOCK_ID_MAP, config.endpoints.cache);

const cacheBlocks = async (blocks) => {
	blocks = Array.isArray(blocks) ? blocks : [blocks];

	await BluebirdPromise.map(
		blocks,
		async block => {
			await blocksCache.set(block.header.id, JSON.stringify(block));
			await BluebirdPromise.map(
				block.transactions,
				async transaction => txToBlockCache.set(transaction.id, block.header.id),
				{ concurrency: block.transactions.length },
			);
		},
		{ concurrency: blocks.length },
	);
};

module.exports = {
	cacheBlocks,
};
