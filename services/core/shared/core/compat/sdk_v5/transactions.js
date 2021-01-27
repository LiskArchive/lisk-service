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
const { getAddressFromPublicKey } = require('@liskhq/lisk-cryptography');
const coreApi = require('./coreApi');
const { getRegisteredModuleAssets, parseToJSONCompatObj } = require('../common');
const { knex } = require('../../../database');

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
	const transactionsDB = await knex('transactions');
	const txnMultiArray = blocks.map(block => {
		const transactions = block.payload.map(tx => {
			const [{ id }] = availableLiskModuleAssets
				.filter(module => module.id === String(tx.moduleID).concat(':').concat(tx.assetID));
			const senderId = getAddressFromPublicKey(Buffer.from(tx.senderPublicKey, 'hex'));
			const skimmedTransaction = {};
			skimmedTransaction.id = tx.id;
			skimmedTransaction.height = block.height;
			skimmedTransaction.blockId = block.id;
			skimmedTransaction.moduleAssetId = id;
			skimmedTransaction.timestamp = block.timestamp;
			skimmedTransaction.senderPublicKey = tx.senderPublicKey;
			skimmedTransaction.senderId = senderId.toString('hex');
			skimmedTransaction.nonce = tx.nonce;
			skimmedTransaction.amount = tx.asset.amount || null;
			skimmedTransaction.recipientId = tx.asset.recipientAddress || null;
			return skimmedTransaction;
		});
		return transactions;
	});
	let allTransactions = [];
	txnMultiArray.forEach(transactions => allTransactions = allTransactions.concat(transactions));
	const result = await transactionsDB.writeBatch(allTransactions);
	return result;
};

const normalizeTransaction = tx => {
	const [{ id, name }] = availableLiskModuleAssets
		.filter(module => module.id === String(tx.moduleID).concat(':').concat(tx.assetID));
	tx = parseToJSONCompatObj(tx);
	tx.moduleAssetId = id;
	tx.moduleAssetName = name;
	return tx;
};

const getTransactions = async params => {
	const transactionsDB = await knex('transactions');
	const transactions = {
		data: [],
		meta: {},
	};
	if (params.fromTimestamp || params.toTimestamp) {
		params.propBetween = {
			property: 'timestamp',
			from: Number(params.fromTimestamp) || 0,
			to: Number(params.toTimestamp) || Math.floor(Date.now() / 1000),
		};
	}
	if (params.moduleAssetName) params.moduleAssetId = resolveModuleAsset(params.moduleAssetName);
	delete params.moduleAssetName;

	// TODO: Add check to ensure nonce based sorting always requires senderId,
	// Update once account index is implemented.
	const resultSet = await transactionsDB.find(params);
	if (resultSet.length) params.ids = resultSet.map(row => row.id);
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
			transaction.senderId = indexedTxInfo.senderId;
			return transaction;
		},
		{ concurrency: transactions.data.length },
	);
	transactions.meta.total = transactions.meta.count;
	transactions.meta.count = transactions.data.length;
	transactions.meta.offset = params.offset || 0;
	return transactions;
};

module.exports = {
	getTransactions,
	indexTransactions,
};
