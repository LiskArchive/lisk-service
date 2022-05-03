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
	Exceptions: { InvalidParamsException, NotFoundException },
} = require('lisk-service-framework');

const blockSource = require('./blocks');
const { getAvailableModuleCommands } = require('../../constants');

const { getTableInstance } = require('../../database/mysql');
const transactionsIndexSchema = require('../../database/schema/transactions');

const {
	getHexAddressFromPublicKey,
	getBase32AddressFromPublicKey,
	getBase32AddressFromHex,
	getIndexedAccountInfo,
	getAccountsBySearch,
} = require('../../utils/accountUtils');
const { requestConnector } = require('../../utils/request');
const { normalizeRangeParam } = require('../../utils/paramUtils');
const { parseToJSONCompatObj } = require('../../utils/parser');

const getTransactionsIndex = () => getTableInstance('transactions', transactionsIndexSchema);

const resolveModuleCommand = async (moduleCommandVal) => {
	const availableModuleCommands = await getAvailableModuleCommands();
	const [module, command] = moduleCommandVal.split(':');
	let response;
	if (!Number.isNaN(Number(module)) && !Number.isNaN(Number(command))) {
		const { name } = (availableModuleCommands
			.find(moduleCommand => moduleCommand.id === moduleCommandVal));
		response = name;
	} else {
		const { id } = (availableModuleCommands
			.find(moduleCommand => moduleCommand.name === moduleCommandVal));
		response = id;
	}
	if ([undefined, null, '']
		.includes(response)) return new Error(`Incorrect moduleCommand ID/Name combination: ${moduleCommandVal}`);
	return response;
};

const getTransactionsByBlockIDs = async blockIDs => {
	const transactionsDB = await getTransactionsIndex();
	const transactions = await transactionsDB.find({
		whereIn: {
			property: 'blockId',
			values: blockIDs,
		},
	}, ['id']);
	const transactionsIds = transactions.map(t => t.id);
	return transactionsIds;
};

const normalizeTransaction = async txs => {
	const availableModuleCommands = await getAvailableModuleCommands();
	const normalizedTransactions = await BluebirdPromise.map(
		txs,
		async tx => {
			const [{ id, name }] = availableModuleCommands
				.filter(module => module.id === String(tx.moduleID).concat(':', tx.commandID));
			tx = parseToJSONCompatObj(tx);
			tx.moduleCommandId = id;
			tx.moduleCommandName = name;
			if (tx.params.recipientAddress) {
				tx.params.recipientAddress = getBase32AddressFromHex(tx.params.recipientAddress);
			}
			if (tx.params.votes && tx.params.votes.length) {
				tx.params.votes
					.forEach(vote => vote.delegateAddress = getBase32AddressFromHex(vote.delegateAddress));
			}
			return tx;
		},
		{ concurrency: txs.length },
	);
	return normalizedTransactions;
};

const getTransactionByID = async id => {
	const response = await requestConnector('getTransactionByID', { id });
	return normalizeTransaction([response]);
};

const getTransactionsByIDs = async ids => {
	const response = await requestConnector('getTransactionsByIDs', { ids });
	return normalizeTransaction(response);
};

const validateParams = async params => {
	if (params.amount && params.amount.includes(':')) {
		params = normalizeRangeParam(params, 'amount');
	}

	if (params.height && typeof params.height === 'string' && params.height.includes(':')) {
		params = normalizeRangeParam(params, 'height');
	}

	if (params.timestamp && params.timestamp.includes(':')) {
		params = normalizeRangeParam(params, 'timestamp');
	}

	if (params.nonce && !(params.senderAddress || params.senderPublicKey)) {
		throw new InvalidParamsException('Nonce based retrieval is only possible along with senderAddress or senderPublicKey');
	}

	if (params.senderIdOrRecipientId) {
		const { senderIdOrRecipientId, ...remParams } = params;
		params = remParams;

		params.senderId = senderIdOrRecipientId;
		params.orWhere = { recipientId: senderIdOrRecipientId };
	}

	if (params.senderId) {
		const { senderId, ...remParams } = params;
		params = remParams;
		params.senderAddress = senderId;
	}

	if (params.senderAddress) {
		const { senderAddress, ...remParams } = params;
		params = remParams;

		const account = await getIndexedAccountInfo({ address: senderAddress, limit: 1 }, ['publicKey']);
		if (!account) throw new NotFoundException(`Account ${senderAddress} not found.`);
		if (params.orWhere && params.orWhere.recipientId) {
			params.orWhereWith = { senderPublicKey: account.publicKey };
		} else {
			params.senderPublicKey = account.publicKey;
		}
	}

	if (params.senderUsername) {
		const { senderUsername, ...remParams } = params;
		params = remParams;

		const account = await getIndexedAccountInfo({ username: senderUsername, limit: 1 }, ['publicKey']);
		if (!account) throw new NotFoundException(`Account ${senderUsername} not found.`);
		params.senderPublicKey = account.publicKey;
	}

	if (params.recipientPublicKey) {
		const { recipientPublicKey, ...remParams } = params;
		params = remParams;

		const account = await getIndexedAccountInfo({ publicKey: recipientPublicKey, limit: 1 }, ['address']);
		if (!account) throw new NotFoundException(`Account ${recipientPublicKey} not found.`);
		params.recipientId = account.address;
	}

	if (params.recipientUsername) {
		const { recipientUsername, ...remParams } = params;
		params = remParams;

		const account = await getIndexedAccountInfo({ username: recipientUsername, limit: 1 }, ['address']);
		if (!account) throw new NotFoundException(`Account ${recipientUsername} not found.`);
		params.recipientId = account.address;
	}

	if (params.search) {
		const { search, ...remParams } = params;
		params = remParams;

		const accounts = await getAccountsBySearch('username', search, ['address', 'publicKey']);
		const publicKeys = accounts.map(account => account.publicKey);
		const addresses = await BluebirdPromise.map(
			accounts,
			async account => {
				const accountInfo = await getIndexedAccountInfo({ address: account.address, limit: 1 }, ['publicKey']);
				if (accountInfo && accountInfo.publicKey) publicKeys.push(accountInfo.publicKey);
				return account.address;
			},
			{ concurrency: accounts.length },
		);
		params.whereIn = { property: 'senderPublicKey', values: publicKeys };
		params.orWhereIn = { property: 'recipientId', values: addresses };
	}

	if (params.data) {
		const { data, ...remParams } = params;
		params = remParams;

		params.search = {
			property: 'data',
			pattern: data,
		};
	}

	if (params.moduleCommandName) {
		const { moduleCommandName, ...remParams } = params;
		params = remParams;

		params.moduleCommandId = await resolveModuleCommand(moduleCommandName);
	}

	return params;
};

const getTransactions = async params => {
	const transactionsDB = await getTransactionsIndex();
	const transactions = {
		data: [],
		meta: {},
	};

	params = await validateParams(params);

	const resultSet = await transactionsDB.find(params, ['id', 'timestamp', 'height', 'blockId']);
	const total = await transactionsDB.count(params);
	params.ids = resultSet.map(row => row.id);

	if (params.ids.length) {
		const BATCH_SIZE = 10;
		for (let i = 0; i < Math.ceil(params.ids.length / BATCH_SIZE); i++) {
			transactions.data = transactions.data
				// eslint-disable-next-line no-await-in-loop
				.concat(await getTransactionsByIDs(params.ids.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)));
		}
	} else if (params.id) {
		transactions.data = await getTransactionByID(params.id);
		if ('offset' in params && params.limit) transactions.data = transactions.data.slice(params.offset, params.offset + params.limit);
	}

	transactions.data = await BluebirdPromise.map(
		transactions.data,
		async transaction => {
			const [indexedTxInfo] = resultSet.filter(tx => tx.id === transaction.id);
			if (indexedTxInfo) {
				transaction.unixTimestamp = indexedTxInfo.timestamp;
				transaction.height = indexedTxInfo.height;
				transaction.blockId = indexedTxInfo.blockId;
			}
			const account = await getIndexedAccountInfo({
				publicKey: transaction.senderPublicKey,
				limit: 1,
			}, ['address', 'username']);
			transaction.senderId = account && account.address ? account.address
				: getBase32AddressFromHex(getHexAddressFromPublicKey(transaction.senderPublicKey));
			transaction.username = account && account.username ? account.username : undefined;
			transaction.isPending = false;

			// For recipient info
			if (transaction.asset.recipientAddress) {
				const { recipientAddress, ...asset } = transaction.asset;
				const recipientInfo = await getIndexedAccountInfo({
					address: recipientAddress,
					limit: 1,
				}, ['address', 'publicKey', 'username']);
				transaction.asset = asset;
				transaction.asset.recipient = {};
				transaction.asset.recipient = {
					address: recipientInfo
						&& (recipientInfo.address !== null) ? recipientInfo.address : undefined,
					publicKey: recipientInfo
						&& (recipientInfo.publicKey !== null) ? recipientInfo.publicKey : undefined,
					username: recipientInfo
						&& (recipientInfo.username !== null) ? recipientInfo.username : undefined,
				};
			}

			// The two lines below are needed for transaction statistics
			if (transaction.moduleAssetId) transaction.type = transaction.moduleAssetId;
			transaction.amount = transaction.asset.amount || 0;

			return transaction;
		},
		{ concurrency: transactions.data.length },
	);
	transactions.meta.total = total;
	transactions.meta.count = transactions.data.length;
	transactions.meta.offset = params.offset;
	return transactions;
};

const getTransactionsByBlockId = async blockId => {
	const [block] = await blockSource.getBlockByID(blockId);
	const transactions = await BluebirdPromise.map(
		block.payload,
		async transaction => {
			transaction.unixTimestamp = block.header.timestamp;
			transaction.height = block.header.height;
			transaction.blockId = block.header.id;
			const account = await getIndexedAccountInfo({
				publicKey: transaction.senderPublicKey,
				limit: 1,
			}, ['address', 'publicKey', 'username']);
			transaction.senderId = account && account.address
				? account.address
				: getBase32AddressFromPublicKey(transaction.senderPublicKey);
			transaction.username = account && account.username ? account.username : undefined;
			transaction.isPending = false;
			return transaction;
		},
		{ concurrency: block.payload.length },
	);
	return {
		data: await normalizeTransaction(transactions),
		meta: {
			offset: 0,
			count: transactions.length,
			total: transactions.length,
		},
	};
};

module.exports = {
	getTransactions,
	getTransactionsByBlockIDs,
	getTransactionsByBlockId,
	getTransactionsByIDs,
	normalizeTransaction,
};
