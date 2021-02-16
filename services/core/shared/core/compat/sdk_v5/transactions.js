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
const BluebirdPromise = require('bluebird');

const coreApi = require('./coreApi');
const {
	indexAccountsbyAddress,
	indexAccountsbyPublicKey,
	getIndexedAccountInfo,
	getBase32AddressFromHex,
	getAccountsBySearch,
} = require('./accounts');
const { getRegisteredModuleAssets } = require('../common');
const { parseToJSONCompatObj } = require('../../../jsonTools');

const mysqlIndex = require('../../../indexdb/mysql');
const transactionsIndexSchema = require('./schema/transactions');

const getTransactionsIndex = () => mysqlIndex('transactions', transactionsIndexSchema);

const availableLiskModuleAssets = getRegisteredModuleAssets();

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
	const recipientAddressesToIndex = [];
	const txnMultiArray = blocks.map(block => {
		const transactions = block.payload.map(tx => {
			const [{ id }] = availableLiskModuleAssets
				.filter(module => module.id === String(tx.moduleID).concat(':').concat(tx.assetID));
			tx.height = block.height;
			tx.blockId = block.id;
			tx.moduleAssetId = id;
			tx.timestamp = block.timestamp;
			tx.amount = tx.asset.amount || null;
			if (tx.asset.recipientAddress) {
				tx.recipientId = getBase32AddressFromHex(tx.asset.recipientAddress);
				recipientAddressesToIndex.push(tx.asset.recipientAddress);
			}
			publicKeysToIndex.push(tx.senderPublicKey);
			return tx;
		});
		return transactions;
	});
	let allTransactions = [];
	txnMultiArray.forEach(transactions => allTransactions = allTransactions.concat(transactions));
	if (allTransactions.length) await transactionsDB.upsert(allTransactions);
	if (recipientAddressesToIndex.length) await indexAccountsbyAddress(recipientAddressesToIndex);
	if (publicKeysToIndex.length) await indexAccountsbyPublicKey(publicKeysToIndex);
};

const normalizeTransaction = tx => {
	const [{ id, name }] = availableLiskModuleAssets
		.filter(module => module.id === String(tx.moduleID).concat(':').concat(tx.assetID));
	tx = parseToJSONCompatObj(tx);
	tx.moduleAssetId = id;
	tx.moduleAssetName = name;
	if (tx.asset.recipientAddress) {
		tx.asset.recipientAddress = getBase32AddressFromHex(tx.asset.recipientAddress);
	}
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
		if (!params.propBetweens) params.propBetweens = [];
		params.propBetweens.push({
			property: 'timestamp',
			from: Number(params.fromTimestamp) || 0,
			to: Number(params.toTimestamp) || Math.floor(Date.now() / 1000),
		});
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
	const total = await transactionsDB.count(params);
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
				return transaction;
			},
			{ concurrency: transactions.data.length },
		);
	}
	transactions.meta.total = total;
	transactions.meta.count = transactions.data.length;
	transactions.meta.offset = params.offset || 0;
	return transactions;
};

module.exports = {
	getTransactions,
	indexTransactions,
};
