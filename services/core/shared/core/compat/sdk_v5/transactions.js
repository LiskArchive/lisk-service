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
// const { getBlocks } = require('./blocks');
const { getRegisteredModules, parseToJSONCompatObj } = require('../common');
const { knex } = require('../../../database');

const availableLiskModules = getRegisteredModules();

const indexTransactions = async blocks => {
	const transactionsDB = await knex('transactions');
	const txnMultiArray = blocks.map(block => {
		const transactions = block.payload.map(tx => {
			const txModule = availableLiskModules
				.filter(module => module.id === String(tx.moduleID).concat(':').concat(tx.assetID));
			const skimmedTransaction = {};
			skimmedTransaction.id = tx.id;
			skimmedTransaction.height = block.height;
			skimmedTransaction.blockId = block.id;
			skimmedTransaction.moduleAssetId = txModule[0].id;
			skimmedTransaction.moduleAssetName = txModule[0].name;
			skimmedTransaction.timestamp = block.timestamp;
			skimmedTransaction.senderPublicKey = tx.senderPublicKey;
			skimmedTransaction.nonce = tx.nonce;
			skimmedTransaction.amount = tx.asset.amount;
			skimmedTransaction.recipientId = tx.asset.recipientAddress || null;

			// TODO: Update the below params after accounts index is implemented
			skimmedTransaction.recipientPublicKey = null;
			skimmedTransaction.senderId = null;
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
	const txModule = availableLiskModules
		.filter(module => module.id === String(tx.moduleID).concat(':').concat(tx.assetID));
	tx = parseToJSONCompatObj(tx);
	tx.moduleAssetId = txModule[0].id;
	tx.moduleAssetName = txModule[0].name;
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
	const resultSet = await transactionsDB.find(params);
	if (resultSet.length) params.ids = resultSet.map(row => row.id);
	const response = await coreApi.getTransactions(params);
	if (response.data) transactions.data = response.data.map(tx => normalizeTransaction(tx));
	if (response.meta) transactions.meta = response.meta;

	transactions.data = await BluebirdPromise.map(
		transactions.data,
		async transaction => {
			resultSet.filter(tx => {
				if (tx.id === transaction.id) {
					transaction.unixTimestamp = tx.timestamp;
					transaction.height = tx.height;
					transaction.blockId = tx.blockId;
				}
				return tx;
			});
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
