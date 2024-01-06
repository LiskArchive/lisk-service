/*
 * LiskHQ/lisk-service
 * Copyright © 2024 Lisk Foundation
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
const {
	CacheRedis,
	Signals,
	Utils: { isObject },
} = require('lisk-service-framework');

const config = require('../../config');
const { requestConnector } = require('./request');

let genesisHeight;
let blockTime;
let latestBlock;

const { emaBatchSize } = config.feeEstimates;

const blockByHeightCache = CacheRedis('blockByHeight', config.endpoints.cache);

const isValidBlock = block => {
	if (!isObject(block)) return false;
	return 'assets' in block && 'header' in block && 'transactions' in block;
};

const setLatestBlock = block => {
	if (isValidBlock(block)) latestBlock = block;
};

const getLatestBlock = async () => {
	if (typeof latestBlock !== 'object') {
		latestBlock = await requestConnector('getLastBlock');
	}
	return latestBlock;
};

const getBlockTime = async () => {
	if (typeof blockTime !== 'number') {
		const nodeInfo = await requestConnector('getNodeInfo');
		blockTime = nodeInfo.genesis.blockTime;
	}
	return blockTime;
};

const getGenesisHeight = async () => {
	if (typeof genesisHeight !== 'number') {
		genesisHeight = await requestConnector('getGenesisHeight');
	}
	return genesisHeight;
};

const cacheBlockByHeight = async block => {
	try {
		if (isValidBlock(block)) {
			const numBlocksToKeep = emaBatchSize * 2;
			const blockTimeInMs = (await getBlockTime()) * 1000;

			await blockByHeightCache.set(
				block.header.height,
				JSON.stringify(block),
				numBlocksToKeep * blockTimeInMs,
			);
		}
	} catch (_) {
		// No actions to be taken
	}
};

const emptyCacheBlockByHeight = async block => {
	try {
		if (isValidBlock(block)) {
			await blockByHeightCache.delete(block.header.height);
		}
	} catch (_) {
		// No actions to be taken
	}
};

const getBlockByHeight = async height => {
	const blockStr = await blockByHeightCache.get(height);
	if (blockStr) return JSON.parse(blockStr);

	const block = await requestConnector('getBlockByHeight', { height });
	await cacheBlockByHeight(block);
	return block;
};

Signals.get('newBlock').add(setLatestBlock);
Signals.get('newBlock').add(cacheBlockByHeight);
Signals.get('deleteBlock').add(emptyCacheBlockByHeight);

module.exports = {
	setLatestBlock,
	getLatestBlock,
	getGenesisHeight,
	getBlockByHeight,
};
