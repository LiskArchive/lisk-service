/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const { Logger } = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const logger = Logger();

const coreApi = require('./coreApi');
const {
	indexAccountsbyPublicKey,
	getIndexedAccountInfo,
	getAccountsBySearch,
} = require('./accounts');
const { getRegisteredModuleAssets, parseToJSONCompatObj } = require('../common');

const mysqlIndex = require('../../../indexdb/mysql');
const transactionsIndexSchema = require('./schema/transactions');

const getTransactionsIndex = () => mysqlIndex('transactions', transactionsIndexSchema);

const availableLiskModuleAssets = getRegisteredModuleAssets();
let pendingTransactionsList = [];

const resolveModuleAsset = (moduleAssetVal) => {
	const [module, asset] = moduleAssetVal.split(':');
	let response;
	if (!Number.isNaN(Number(module)) && !Number.isNaN(Number(asset))) {
		const [{ name }] = (availableLiskModuleAssets
			.filter(moduleAsset => moduleAsset.id === moduleAssetVal));
		response = name;
	} else {
		const [{ id }] = (availableLiskModuleAssets
			.filter(moduleAsset => moduleAsset.name === moduleAssetVal));
		response = id;
	}
	if ([undefined, null, '']
		.includes(response)) return new Error(`Incorrect moduleAsset ID/Name combination: ${moduleAssetVal}`);
	return response;
};

const indexTransactions = async blocks => {
	const transactionsDB = await getTransactionsIndex();
	const publicKeysToIndex = [];
	const txnMultiArray = blocks.map(block => {
		const transactions = block.payload.map(tx => {
			const [{ id }] = availableLiskModuleAssets
				.filter(module => module.id === String(tx.moduleID).concat(':').concat(tx.assetID));
			const skimmedTransaction = {};
			skimmedTransaction.id = tx.id;
			skimmedTransaction.height = block.height;
			skimmedTransaction.blockId = block.id;
			skimmedTransaction.moduleAssetId = id;
			skimmedTransaction.timestamp = block.timestamp;
			skimmedTransaction.senderPublicKey = tx.senderPublicKey;
			skimmedTransaction.nonce = tx.nonce;
			skimmedTransaction.amount = tx.asset.amount || null;
			skimmedTransaction.recipientId = tx.asset.recipientAddress || null;
			skimmedTransaction.data = tx.asset.data || null;
			publicKeysToIndex.push(tx.senderPublicKey);
			return skimmedTransaction;
		});
		return transactions;
	});
	let allTransactions = [];
	txnMultiArray.forEach(transactions => allTransactions = allTransactions.concat(transactions));
	if (allTransactions.length) await transactionsDB.upsert(allTransactions);
	if (publicKeysToIndex.length) await indexAccountsbyPublicKey(publicKeysToIndex);
};

const normalizeTransaction = tx => {
	const [{ id, name }] = availableLiskModuleAssets
		.filter(module => module.id === String(tx.moduleID).concat(':').concat(tx.assetID));
	tx = parseToJSONCompatObj(tx);
	tx.moduleAssetId = id;
	tx.moduleAssetName = name;
	return tx;
};

const validateParams = async params => {
	if (params.timestamp && params.timestamp.includes(':')) [params.fromTimestamp, params.toTimestamp] = params.timestamp.split(':');
	delete params.timestamp;

	if (params.amount && params.amount.includes(':')) {
		params.propBetween = {
			property: 'amount',
			from: params.amount.split(':')[0],
			to: params.amount.split(':')[1],
		};
		delete params.amount;
	}

	if (params.fromTimestamp || params.toTimestamp) {
		params.propBetween = {
			property: 'timestamp',
			from: params.fromTimestamp || 0,
			to: params.toTimestamp || Math.floor(Date.now() / 1000),
		};
		delete params.fromTimestamp;
		delete params.toTimestamp;
	}

	if (params.sort && params.sort.includes('nonce') && !params.senderId) {
		throw new Error('Nonce based sorting is only possible along with senderId');
	}

	if (params.username) {
		const [accountInfo] = await getIndexedAccountInfo({ username: params.username });
		if (!accountInfo || accountInfo.address === undefined) return new Error(`Account with username: ${params.username} does not exist`);
		params.senderPublicKey = accountInfo.publicKey;
		delete params.username;
	}

	if (params.senderIdOrRecipientId) {
		params.senderId = params.senderIdOrRecipientId;
		params.orWhere = { recipientId: params.senderIdOrRecipientId };
		delete params.senderIdOrRecipientId;
	}

	if (params.senderId) {
		const account = await getIndexedAccountInfo({ address: params.senderId });
		params.senderPublicKey = account.publicKey;
		delete params.senderId;
	}

	if (params.search) {
		const accounts = await getAccountsBySearch('username', params.search);
		delete params.search;
		const publicKeys = accounts.map(account => account.publicKey);
		const addresses = await BluebirdPromise.map(
			accounts,
			async account => {
				const accountInfo = await getIndexedAccountInfo({ address: account.address });
				publicKeys.push(accountInfo.publicKey);
				return account.address;
			},
			{ concurrency: accounts.length },
		);
		params.whereIn = { property: 'senderPublicKey', values: publicKeys };
		params.orWhereIn = { property: 'recipientId', values: addresses };
	}

	if (params.data) {
		params.search = {
			property: 'data',
			pattern: params.data,
		};
		delete params.data;
	}

	if (params.moduleAssetName) params.moduleAssetId = resolveModuleAsset(params.moduleAssetName);
	delete params.moduleAssetName;

	return params;
};

const getTransactions = async params => {
	const transactionsDB = await getTransactionsIndex();
	const transactions = {
		data: [],
		meta: {},
	};

	params = await validateParams(params);

	const resultSet = await transactionsDB.find(params);
	if (resultSet.length) params.ids = resultSet.map(row => row.id);
	if (params.ids || params.id) {
		const response = await coreApi.getTransactions(params);
		if (response.data) transactions.data = response.data.map(tx => normalizeTransaction(tx));
		if (response.meta) transactions.meta = response.meta;

		transactions.data = await BluebirdPromise.map(
			transactions.data,
			async transaction => {
				const [indexedTxInfo] = resultSet.filter(tx => tx.id === transaction.id);
				transaction.unixTimestamp = indexedTxInfo.timestamp;
				transaction.height = indexedTxInfo.height;
				transaction.blockId = indexedTxInfo.blockId;
				const account = await getIndexedAccountInfo({ publicKey: transaction.senderPublicKey });
				transaction.senderId = account && account.address ? account.address : undefined;
				transaction.username = account && account.username ? account.username : undefined;
				transaction.isPending = false;
				return transaction;
			},
			{ concurrency: transactions.data.length },
		);
	}
	transactions.meta.total = transactions.meta.count;
	transactions.meta.count = transactions.data.length;
	transactions.meta.offset = params.offset || 0;
	return transactions;
};

const getPendingTransactionsFromCore = async () => {
	const response = await coreApi.getPendingTransactions();
	let pendingTx = response.data.map(tx => normalizeTransaction(tx));
	pendingTx = await BluebirdPromise.map(
		pendingTx,
		async transaction => {
			const account = await getIndexedAccountInfo({ publicKey: transaction.senderPublicKey });
			transaction.senderId = account && account.address ? account.address : undefined;
			transaction.username = account && account.username ? account.username : undefined;
			transaction.isPending = true;
			return transaction;
		},
		{ concurrency: pendingTx.length },
	);
	return pendingTx;
};

const loadAllPendingTransactions = async () => {
	pendingTransactionsList = await getPendingTransactionsFromCore();
	logger.info(`Initialized/Updated pending transactions cache with ${pendingTransactionsList.length} transactions.`);
};

const getPendingTransactions = async params => {
	const pendingTransactions = {
		data: [],
		meta: {},
	};
	const requestParams = {};
	const offset = Number(params.offset) || 0;
	const limit = Number(params.limit) || 10;

	if (params.sort && params.sort.includes('nonce') && !params.senderId) {
		throw new Error('Nonce based sorting is only possible along with senderId');
	}

	if (params.username) {
		const [accountInfo] = await getIndexedAccountInfo({ username: params.username });
		if (!accountInfo || accountInfo.address === undefined) return new Error(`Account with username: ${params.username} does not exist`);
		requestParams.senderPublicKey = accountInfo.publicKey;
	}

	if (params.senderIdOrRecipientId) {
		requestParams.senderId = params.senderIdOrRecipientId;
		requestParams.recipientId = params.senderIdOrRecipientId;
	}

	if (params.senderId) {
		const account = await getIndexedAccountInfo({ address: params.senderId });
		requestParams.senderPublicKey = account.publicKey;
	}

	if (params.amount && params.amount.includes(':')) {
		const from = params.amount.split(':')[0];
		const to = params.amount.split(':')[1];
		requestParams.from = Number(from);
		requestParams.to = Number(to);
	}

	const sortComparator = (sortParam) => {
		const sortProp = sortParam.split(':')[0];
		const sortOrder = sortParam.split(':')[1];

		const comparator = (a, b) => (sortOrder === 'asc')
			? Number(a[sortProp]) - Number(b[sortProp])
			: Number(b[sortProp]) - Number(a[sortProp]);
		return comparator;
	};

	if (pendingTransactionsList.length) {
		pendingTransactions.data = pendingTransactionsList.filter(transaction => (
			(!requestParams.senderPublicKey
				|| transaction.senderPublicKey === requestParams.senderPublicKey)
			&& (!requestParams.recipientId
				|| transaction.asset.recipientAddress === requestParams.recipientId)
			&& (!requestParams.moduleAssetId
				|| transaction.amoduleAssetId === requestParams.moduleAssetId)
			&& (!requestParams.moduleAssetName
				|| transaction.moduleAssetName === requestParams.moduleAssetName)
			&& (!requestParams.data
				|| transaction.asset.data.includes(requestParams.data))
			&& (!requestParams.data
				|| transaction.asset.data.includes(requestParams.data))
			&& (!requestParams.from
				|| Number(transaction.amount) >= requestParams.from)
			&& (!requestParams.to
				|| Number(transaction.amount) <= requestParams.to)
		));
		pendingTransactions.data = pendingTransactions.data
			.sort(sortComparator(params.sort))
			.slice(offset, offset + limit);

		pendingTransactions.meta = {
			count: pendingTransactions.data.length,
			offset,
			total: pendingTransactionsList.length,
		};
	}
	return pendingTransactions;
};

module.exports = {
	getTransactions,
	indexTransactions,
	getPendingTransactions,
	loadAllPendingTransactions,
};
