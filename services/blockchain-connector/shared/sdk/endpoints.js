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
const {
	Exceptions: {
		TimeoutException,
	},
} = require('lisk-service-framework');

const {
	getSchemas,
	getRegisteredActions,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
	getSystemMetadata,
} = require('./endpoints_1');
const {
	cacheBlocks,
	getBlockByIDFromCache,
	getBlockByIDsFromCache,
	getTransactionByIDFromCache,
	getTransactionByIDsFromCache,
} = require('./cache');
const config = require('../../config');
const { timeoutMessage, invokeEndpoint } = require('./client');
const { getGenesisHeight, getGenesisBlockID, getGenesisBlock } = require('./genesisBlock');

const getNetworkConnectedPeers = async () => {
	try {
		const connectedPeers = await invokeEndpoint('network_getConnectedPeers');
		return connectedPeers;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getNetworkConnectedPeers\'.');
		}
		throw err;
	}
};

const getNetworkDisconnectedPeers = async () => {
	try {
		const disconnectedPeers = await invokeEndpoint('network_getDisconnectedPeers');
		return disconnectedPeers;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getNetworkDisconnectedPeers\'.');
		}
		throw err;
	}
};

const getGeneratorStatus = async () => {
	try {
		const forgingStatus = await invokeEndpoint('generator_getStatus');
		return forgingStatus;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getGeneratorStatus\'.');
		}
		throw err;
	}
};

const updateGeneratorStatus = async (generatorConfig) => {
	try {
		const response = await invokeEndpoint('generator_updateStatus', { ...generatorConfig });
		return response;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'updateGeneratorStatus\'.');
		}
		throw err;
	}
};

const getLastBlock = async () => {
	try {
		const block = await invokeEndpoint('chain_getLastBlock');
		return block;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getLastBlock\'.');
		}
		throw err;
	}
};

const getBlockByHeight = async (height, includeGenesisAssets = false) => {
	try {
		if (Number(height) === await getGenesisHeight()) {
			return getGenesisBlock(includeGenesisAssets);
		}

		const block = await invokeEndpoint('chain_getBlockByHeight', { height });
		if (config.caching.isEnabled) await cacheBlocks(block);
		return block;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getBlockByHeight' for height: ${height}.`);
		}
		throw err;
	}
};

const getBlocksByHeightBetween = async ({ from, to }) => {
	try {
		const gHeight = await getGenesisHeight();
		const blocksArr = [[], []];

		if (from < gHeight) {
			throw new Error(`'from' cannot be lower than the genesis height (${gHeight}).`);
		}

		// File based Genesis block handling
		if (Number(from) === gHeight) {
			blocksArr[0] = await getBlockByHeight(gHeight);
			from++;
		}

		if (from <= to) {
			blocksArr[1] = await invokeEndpoint('chain_getBlocksByHeightBetween', { from, to });
		}

		const blocks = ([blocksArr[0], ...blocksArr[1]]);
		if (config.caching.isEnabled) await cacheBlocks(blocks);
		return blocks;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getBlocksByHeightBetween' for heights: ${from} - ${to}.`);
		}
		throw err;
	}
};

const getBlockByID = async (id, includeGenesisAssets = false) => {
	try {
		// File based Genesis block handling
		if (id === await getGenesisBlockID()) {
			return getGenesisBlock(includeGenesisAssets);
		}

		const blockFromCache = await getBlockByIDFromCache(id);
		if (blockFromCache) return blockFromCache;

		const block = await invokeEndpoint('chain_getBlockByID', { id });
		if (config.caching.isEnabled) await cacheBlocks(block);
		return block;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getBlockByID' for ID: ${id}.`);
		}
		throw err;
	}
};

const getBlocksByIDs = async (ids) => {
	try {
		// File based Genesis block handling
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

		const blocksFromCache = await getBlockByIDsFromCache(ids);
		if (blocksFromCache) return blocksFromCache;

		const blocks = await invokeEndpoint('chain_getBlocksByIDs', { ids });
		if (config.caching.isEnabled) await cacheBlocks(blocks);
		return blocks;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getBlocksByIDs' for IDs: ${ids}.`);
		}
		throw err;
	}
};

const getEventsByHeight = async (height) => {
	try {
		const events = await invokeEndpoint('chain_getEvents', { height });
		return events;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getEvents\'.');
		}
		throw err;
	}
};

const getTransactionByID = async (id) => {
	try {
		const transactionFromCache = await getTransactionByIDFromCache(id);
		if (transactionFromCache) return transactionFromCache;

		const transaction = await invokeEndpoint('chain_getTransactionByID', { id });
		return transaction;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getTransactionByID' for ID: ${id}.`);
		}
		throw err;
	}
};

const getTransactionsByIDs = async (ids) => {
	try {
		const transactionsFromCache = await getTransactionByIDsFromCache(ids);
		if (transactionsFromCache) return transactionsFromCache;

		const transaction = await invokeEndpoint('chain_getTransactionsByIDs', { ids });
		return transaction;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getTransactionsByIDs' for IDs: ${ids}.`);
		}
		throw err;
	}
};

const getTransactionsFromPool = async () => {
	try {
		const transactions = await invokeEndpoint('txpool_getTransactionsFromPool');
		return transactions;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getTransactionsFromPool\'.');
		}
		throw err;
	}
};

const postTransaction = async (transaction) => {
	try {
		const response = await invokeEndpoint('txpool_postTransaction', { transaction });
		return response;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'postTransaction' with transaction: ${transaction}.`);
		}
		throw err;
	}
};

const dryRunTransaction = async ({ transaction, skipVerify }) => {
	try {
		const response = await invokeEndpoint('txpool_dryRunTransaction', { transaction, skipVerify });
		return response;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'dryRunTransaction' with transaction: ${transaction}.`);
		}
		throw err;
	}
};

const getGenerators = async () => {
	try {
		const generators = await invokeEndpoint('chain_getGeneratorList');
		return generators;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getGenerators\'.');
		}
		throw err;
	}
};

module.exports = {
	invokeEndpoint,
	getSchemas,
	getRegisteredActions,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
	getSystemMetadata,
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
};
