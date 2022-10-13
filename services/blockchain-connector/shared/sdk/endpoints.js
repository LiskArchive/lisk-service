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
	Logger,
	Exceptions: {
		NotFoundException,
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
const { timeoutMessage, getApiClient, invokeEndpoint, invokeEndpointProxy } = require('./client');
const { decodeAccount } = require('./decoder');
const { parseToJSONCompatObj } = require('../utils/parser');
const { getGenesisHeight, getGenesisBlockID, getGenesisBlock } = require('./genesisBlock');

const logger = Logger();

const getConnectedPeers = async () => {
	try {
		const connectedPeers = await invokeEndpoint('network_getConnectedPeers');
		return connectedPeers;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getConnectedPeers\'');
		}
		throw err;
	}
};

const getDisconnectedPeers = async () => {
	try {
		const disconnectedPeers = await invokeEndpoint('network_getDisconnectedPeers');
		return disconnectedPeers;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getDisconnectedPeers\'');
		}
		throw err;
	}
};

const getForgingStatus = async () => {
	try {
		const forgingStatus = await invokeEndpoint('generator_getForgingStatus');
		return forgingStatus;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getForgingStatus\'');
		}
		throw err;
	}
};

const updateForgingStatus = async (config) => {
	try {
		const apiClient = await getApiClient();
		const response = await apiClient._channel.invoke('generator_updateForgingStatus', { ...config });
		return response;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'updateForgingStatus\'');
		}
		throw err;
	}
};

const getAccount = async (address) => {
	try {
		const encodedAccount = await invokeEndpoint('app_getAccount', { address });
		const account = await decodeAccount(encodedAccount);
		return { ...parseToJSONCompatObj(account), _raw: encodedAccount };
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getAccount' for address: ${address}`);
		} else if (err.message === `Specified key accounts:address:${address} does not exist`) {
			throw new NotFoundException(`Account ${address} does not exist on the blockchain`);
		}
		logger.warn(`Unable to currently fetch account information for address: ${address}. The network synchronization process might still be in progress for the Lisk Core node or the requested account has not been migrated yet.`);
		throw new Error('MISSING_ACCOUNT_IN_BLOCKCHAIN');
	}
};

const getAccounts = async (addresses) => {
	try {
		const encodedAccounts = await invokeEndpoint('app_getAccounts', { address: addresses });
		const accounts = await BluebirdPromise.map(
			encodedAccounts,
			async (account) => ({
				...(await decodeAccount(account)),
				_raw: account,
			}),
			{ concurrency: encodedAccounts.length },
		);
		return parseToJSONCompatObj(accounts);
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getAccounts' for addresses: ${addresses}`);
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
			throw new TimeoutException('Request timed out when calling \'getLastBlock\'');
		}
		throw err;
	}
};

const getBlockByHeight = async (height) => {
	try {
		if (Number(height) === await getGenesisHeight()) {
			return getGenesisBlock();
		}

		const block = await invokeEndpoint('chain_getBlockByHeight', { height });
		return block;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getBlockByHeight' for height: ${height}`);
		}
		throw err;
	}
};

const getBlocksByHeightBetween = async ({ from, to }) => {
	try {
		const gHeight = await getGenesisHeight();
		const blocks = [[], []];

		if (from < gHeight) {
			throw new Error(`'from' cannot be lower than the genesis height (${gHeight})`);
		}

		// File based Genesis block handling
		if (Number(from) === gHeight) {
			blocks[0] = await getBlockByHeight(gHeight);
			from++;
		}

		if (from <= to) {
			blocks[1] = await invokeEndpoint('chain_getBlocksByHeightBetween', { from, to });
		}

		return ([blocks[0], ...blocks[1]]);
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getBlocksByHeightBetween' for heights: ${from} - ${to}`);
		}
		throw err;
	}
};

const getBlockByID = async (id) => {
	try {
		// File based Genesis block handling
		if (id === await getGenesisBlockID()) {
			return getGenesisBlock();
		}

		const block = await invokeEndpoint('chain_getBlockByID', { id });
		return block;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getBlockByID' for ID: ${id}`);
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
			return remainingBlocks.splice(genesisBlockIndex, 0, genesisBlock);
		}

		const blocks = await invokeEndpoint('chain_getBlocksByIDs', { ids });
		return blocks;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getBlocksByIDs' for IDs: ${ids}`);
		}
		throw err;
	}
};

const getTransactionByID = async (id) => {
	try {
		const transaction = await invokeEndpoint('chain_getTransactionByID', { id });
		return transaction;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getTransactionByID' for ID: ${id}`);
		}
		throw err;
	}
};

const getTransactionsByIDs = async (ids) => {
	try {
		const transaction = await invokeEndpoint('chain_getTransactionsByIDs', { ids });
		return transaction;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getTransactionsByIDs' for IDs: ${ids}`);
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
			throw new TimeoutException('Request timed out when calling \'getTransactionsFromPool\'');
		}
		throw err;
	}
};

const postTransaction = async (transaction) => {
	try {
		const apiClient = await getApiClient();
		const response = await apiClient._channel.invoke('txpool_postTransaction', { transaction });
		return response;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'postTransaction' with transaction: ${transaction}`);
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
			throw new TimeoutException('Request timed out when calling \'getGenerators\'');
		}
		throw err;
	}
};

const dryRunTransaction = async (transaction) => {
	try {
		const apiClient = await getApiClient();
		const response = await apiClient._channel.invoke('txpool_dryRunTransaction', { transaction });
		return response;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'dryRunTransaction' with transaction: ${transaction}`);
		}
		throw err;
	}
};

module.exports = {
	invokeEndpoint,
	invokeEndpointProxy,
	getSchemas,
	getRegisteredActions,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
	getSystemMetadata,
	getConnectedPeers,
	getDisconnectedPeers,
	getForgingStatus,
	updateForgingStatus,
	getAccount,
	getAccounts,
	getLastBlock,
	getBlockByID,
	getBlocksByIDs,
	getBlockByHeight,
	getBlocksByHeightBetween,
	getTransactionByID,
	getTransactionsByIDs,
	getTransactionsFromPool,
	postTransaction,
	getGenerators,
	dryRunTransaction,
};
