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
	Logger,
	Exceptions: {
		NotFoundException,
		TimeoutException,
	},
} = require('lisk-service-framework');

const { getApiClient } = require('./client');
const { decodeAccount, decodeBlock, decodeTransaction } = require('./decoder');
const { parseToJSONCompatObj } = require('../utils/jsonTools');

const delay = require('../utils/delay');

// Constants
const timeoutMessage = 'Response not received in';
const NUM_REQUEST_RETRIES = 5;

const logger = Logger();

// Caching for constants from SDK application
let schema;
let registeredActions;
let registeredEvents;
let registeredModules;

// eslint-disable-next-line consistent-return
const invokeAction = async (action, params = {}, numRetries = NUM_REQUEST_RETRIES) => {
	const apiClient = await getApiClient();
	let retries = numRetries;
	do {
		/* eslint-disable no-await-in-loop */
		try {
			const response = await apiClient._channel.invoke(action, params);
			return response;
		} catch (err) {
			if (retries && err instanceof TimeoutException) await delay(10);
			else throw err;
		}
		/* eslint-enable no-await-in-loop */
	} while (retries--);
};

const getSchema = async () => {
	try {
		if (!schema) {
			schema = await invokeAction('app:getSchema');
		}
		return schema;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getSchema\'');
		}
		throw err;
	}
};

const getRegisteredActions = async () => {
	try {
		if (!registeredActions) {
			registeredActions = await invokeAction('app:getRegisteredActions');
		}
		return registeredActions;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getRegisteredActions\'');
		}
		throw err;
	}
};

const getRegisteredEvents = async () => {
	try {
		if (!registeredEvents) {
			registeredEvents = await invokeAction('app:getRegisteredEvents');
		}
		return registeredEvents;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getRegisteredEvents\'');
		}
		throw err;
	}
};

const getRegisteredModules = async () => {
	try {
		if (!registeredModules) {
			registeredModules = await invokeAction('app:getRegisteredModules');
		}
		return registeredModules;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getRegisteredModules\'');
		}
		throw err;
	}
};

const getNodeInfo = async () => {
	try {
		const nodeInfo = await invokeAction('app:getNodeInfo');
		return nodeInfo;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getNodeInfo\'');
		}
		throw err;
	}
};

const getConnectedPeers = async () => {
	try {
		const connectedPeers = await invokeAction('app:getConnectedPeers');
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
		const disconnectedPeers = await invokeAction('app:getDisconnectedPeers');
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
		const forgingStatus = await invokeAction('app:getForgingStatus');
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
		const response = await apiClient._channel.invoke('app:updateForgingStatus', { ...config });
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
		const encodedAccount = await invokeAction('app:getAccount', { address });
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
		const encodedAccounts = await invokeAction('app:getAccounts', { address: addresses });
		const accounts = await Promise.all(encodedAccounts.map(acc => decodeAccount(acc)));
		return parseToJSONCompatObj(accounts);
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getAccounts' for addresses: ${addresses}`);
		}
		throw err;
	}
};

// const decodeBlock = async (block) => {
// 	const apiClient = await getApiClient();
// 	return apiClient.block.decode(Buffer.from(block, 'hex'));
// };

const getLastBlock = async () => {
	try {
		const encodedBlock = await invokeAction('app:getLastBlock');
		const block = await decodeBlock(encodedBlock);
		return parseToJSONCompatObj(block);
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getLastBlock\'');
		}
		throw err;
	}
};

const getBlockByID = async (id) => {
	try {
		const encodedBlock = await invokeAction('app:getBlockByID', { id });
		const block = await decodeBlock(encodedBlock);
		return parseToJSONCompatObj(block);
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getBlocksByID' for ID: ${id}`);
		}
		throw err;
	}
};

const getBlocksByIDs = async (ids) => {
	try {
		const encodedBlocks = await invokeAction('app:getBlocksByIDs', { ids });
		const blocks = await Promise.all(encodedBlocks.map(blk => decodeBlock(blk)));
		return parseToJSONCompatObj(blocks);
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getBlocksByIDs' for IDs: ${ids}`);
		}
		throw err;
	}
};

const getBlockByHeight = async (height) => {
	try {
		const encodedBlock = await invokeAction('app:getBlockByHeight', { height });
		const block = await decodeBlock(encodedBlock);
		return parseToJSONCompatObj(block);
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getBlockByHeight' for height: ${height}`);
		}
		throw err;
	}
};

const getBlocksByHeightBetween = async ({ from, to }) => {
	try {
		const encodedBlocks = await invokeAction('app:getBlocksByHeightBetween', { from, to });
		const blocks = await Promise.all(encodedBlocks.map(blk => decodeBlock(blk)));
		return parseToJSONCompatObj(blocks);
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getBlocksByHeightBetween' for heights: ${from} - ${to}`);
		}
		throw err;
	}
};

const getTransactionByID = async (id) => {
	try {
		const encodedTransaction = await invokeAction('app:getTransactionByID', { id });
		const transaction = await decodeTransaction(encodedTransaction);
		return parseToJSONCompatObj(transaction);
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getTransactionByID' for ID: ${id}`);
		}
		throw err;
	}
};

const getTransactionsByIDs = async (ids) => {
	try {
		const encodedTransactions = await invokeAction('app:getTransactionsByIDs', { ids });
		const transactions = await Promise.all(encodedTransactions.map(tx => decodeTransaction(tx)));
		return parseToJSONCompatObj(transactions);
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getTransactionsByIDs' for IDs: ${ids}`);
		}
		throw err;
	}
};

const getTransactionsFromPool = async () => {
	try {
		const encodedTransactions = await invokeAction('app:getTransactionsFromPool');
		const transactions = await Promise.all(encodedTransactions.map(tx => decodeTransaction(tx)));
		return parseToJSONCompatObj(transactions);
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
		const response = await apiClient._channel.invoke('app:postTransaction', { transaction });
		return response;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'postTransaction' with transaction: ${transaction}`);
		}
		throw err;
	}
};

const getForgers = async () => {
	try {
		const forgers = await invokeAction('app:getForgers');
		return forgers;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getForgers\'');
		}
		throw err;
	}
};

module.exports = {
	invokeAction,
	getSchema,
	getRegisteredActions,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
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
	getForgers,
};
