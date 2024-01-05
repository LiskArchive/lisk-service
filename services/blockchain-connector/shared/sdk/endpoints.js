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
	getSchemas,
	getRegisteredEndpoints,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
	getSystemMetadata,
	getEngineEndpoints,
} = require('./endpoints_1');
const {
	cacheBlocksIfEnabled,
	getBlockByIDFromCache,
	getTransactionByIDFromCache,
} = require('./cache');
const { invokeEndpoint } = require('./client');
const { getGenesisHeight, getGenesisBlockID, getGenesisBlock } = require('./genesisBlock');

const config = require('../../config');

const getNetworkConnectedPeers = async () => {
	const connectedPeers = await invokeEndpoint('network_getConnectedPeers');
	return connectedPeers;
};

const getNetworkDisconnectedPeers = async () => {
	const disconnectedPeers = await invokeEndpoint('network_getDisconnectedPeers');
	return disconnectedPeers;
};

const getGeneratorStatus = async () => {
	const forgingStatus = await invokeEndpoint('generator_getStatus');
	return forgingStatus;
};

const updateGeneratorStatus = async generatorConfig => {
	const response = await invokeEndpoint('generator_updateStatus', { ...generatorConfig });
	return response;
};

const getLastBlock = async () => {
	const block = await invokeEndpoint('chain_getLastBlock');
	return block;
};

const getBlockByHeight = async (height, includeGenesisAssets = false) => {
	if (Number(height) === (await getGenesisHeight())) {
		return getGenesisBlock(includeGenesisAssets);
	}

	const block = await invokeEndpoint('chain_getBlockByHeight', { height });
	cacheBlocksIfEnabled(block);

	return block;
};

const getBlocksByHeightBetween = async ({ from, to }) => {
	const gHeight = await getGenesisHeight();
	const blocksNestedList = [[], []];

	if (from < gHeight) {
		throw new Error(`'from' cannot be lower than the genesis height (${gHeight}).`);
	}

	// File-based genesis block handling
	if (Number(from) === gHeight) {
		blocksNestedList[0] = await getBlockByHeight(gHeight);
		from++;
	}

	if (from <= to) {
		blocksNestedList[1] = await invokeEndpoint('chain_getBlocksByHeightBetween', { from, to });
	}

	const blocks = blocksNestedList.flat();
	cacheBlocksIfEnabled(blocks);
	return blocks;
};

const getBlockByID = async (id, includeGenesisAssets = false) => {
	// File-based genesis block handling
	if (id === (await getGenesisBlockID())) {
		return getGenesisBlock(includeGenesisAssets);
	}

	const blockFromCache = await getBlockByIDFromCache(id).catch(() => null);
	if (blockFromCache) return blockFromCache;

	const block = await invokeEndpoint('chain_getBlockByID', { id });
	cacheBlocksIfEnabled(block);
	return block;
};

const getBlocksByIDs = async ids => {
	// File-based genesis block handling
	const genesisBlockId = await getGenesisBlockID();
	const genesisBlockIndex = ids.indexOf(genesisBlockId);
	if (genesisBlockIndex !== -1) {
		const remainingIDs = ids.filter(id => id !== genesisBlockId);
		const genesisBlock = await getBlockByID(genesisBlockId);
		if (remainingIDs.length === 0) return [genesisBlock];

		const remainingBlocks = await getBlocksByIDs(remainingIDs);
		remainingBlocks.splice(genesisBlockIndex, 0, genesisBlock);
		return remainingBlocks;
	}

	const blocks = config.cache.isBlockCachingEnabled
		? await BluebirdPromise.map(ids, async id => getBlockByID(id), { concurrency: 1 })
		: await invokeEndpoint('chain_getBlocksByIDs', { ids });

	return blocks;
};

const getEventsByHeight = async height => {
	const events = await invokeEndpoint('chain_getEvents', { height });
	return events;
};

const getTransactionByID = async id => {
	const transactionFromCache = await getTransactionByIDFromCache(id).catch(() => null);
	if (transactionFromCache) return transactionFromCache;

	const transaction = await invokeEndpoint('chain_getTransactionByID', { id });
	return transaction;
};

const getTransactionsByIDs = async ids => {
	const transactions = config.cache.isBlockCachingEnabled
		? await BluebirdPromise.map(ids, async id => getTransactionByID(id), { concurrency: 1 })
		: await invokeEndpoint('chain_getTransactionsByIDs', { ids });

	return transactions;
};

const getTransactionsFromPool = async () => {
	const transactions = await invokeEndpoint('txpool_getTransactionsFromPool');
	return transactions;
};

const postTransaction = async transaction => {
	const response = await invokeEndpoint('txpool_postTransaction', { transaction });
	return response;
};

const dryRunTransaction = async ({ transaction, skipVerify, strict }) => {
	const response = await invokeEndpoint('txpool_dryRunTransaction', {
		transaction,
		skipVerify,
		strict,
	});
	return response;
};

const getGenerators = async () => {
	const generators = await invokeEndpoint('chain_getGeneratorList');
	return generators;
};

const getBFTParameters = async height => {
	const bftParameters = await invokeEndpoint('consensus_getBFTParameters', { height });
	return bftParameters;
};

module.exports = {
	invokeEndpoint,
	getSchemas,
	getRegisteredEndpoints,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
	getSystemMetadata,
	getEngineEndpoints,
	getNetworkConnectedPeers,
	getNetworkDisconnectedPeers,
	getGeneratorStatus,
	updateGeneratorStatus,
	getLastBlock,
	getBlockByID,
	getBlocksByIDs,
	getBlockByHeight,
	getBlocksByHeightBetween,
	getEventsByHeight,
	getTransactionByID,
	getTransactionsByIDs,
	getTransactionsFromPool,
	postTransaction,
	dryRunTransaction,
	getGenerators,
	getBFTParameters,
};
