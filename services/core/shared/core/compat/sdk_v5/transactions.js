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
const { getRegisteredModules } = require('../common');
const { knex } = require('../../../database');

const indexTransactions = async blocks => {
	const transactionsDB = await knex('transactions');
	const txnMultiArray = blocks.map(block => {
		const transactions = block.payload.map(tx => {
			const availableLiskModules = getRegisteredModules();
			const txModule = availableLiskModules
				.filter(module => module.id === String(tx.moduleID).concat(':').concat(tx.assetID));
			const skimmedTransaction = {};
			skimmedTransaction.id = tx.id.toString('hex');
			skimmedTransaction.height = block.height;
			skimmedTransaction.blockId = block.id;
			skimmedTransaction.moduleAssetId = txModule[0].id;
			skimmedTransaction.moduleAssetName = txModule[0].name;
			skimmedTransaction.timestamp = block.unixTimestamp;
			skimmedTransaction.senderPublicKey = tx.senderPublicKey.toString('hex');
			skimmedTransaction.nonce = Number(tx.nonce);
			skimmedTransaction.amount = Number(tx.asset.amount);
			skimmedTransaction.recipientId = tx.asset.recipientAddress.toString('hex') || null;

			// TODO: Check accounts and update the below params
			skimmedTransaction.recipientPublicKey = tx.recipientPublicKey || null;
			skimmedTransaction.senderId = tx.senderId || null;

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
	const availableLiskModules = getRegisteredModules();
	const txModule = availableLiskModules
		.filter(module => module.id === String(tx.moduleID).concat(':').concat(tx.assetID));
	tx.id = tx.id.toString('hex');
	tx.moduleAssetId = txModule[0].id;
	tx.moduleAssetName = txModule[0].name;
	tx.fee = Number(tx.fee);
	tx.nonce = Number(tx.nonce);
	tx.senderPublicKey = tx.senderPublicKey.toString('hex');
	tx.signatures = tx.signatures.map(signature => signature.toString('hex'));
	tx.asset.amount = Number(tx.asset.amount);
	tx.asset.recipientAddress = tx.asset.recipientAddress.toString('hex');
	return tx;
};

const getTransactions = async params => {
	const transactionsDB = await knex('transactions');
	const transactions = {
		data: [],
		meta: {},
	};

	if (params.sort
		&& ['nonce', 'timestamp', 'amount'].some(prop => params.sort.includes(prop))) {
		const sortProp = params.sort.split(':')[0];
		const sortOrder = params.sort.split(':')[1];
		params.sort = [{ column: sortProp, order: sortOrder }];
	}
	if (params.fromTimestamp || params.toTimestamp) {
		params.fromTimestamp = Number(params.fromTimestamp) || 0;
		params.toTimestamp = Number(params.toTimestamp) || Math.floor(Date.now() / 1000);
	}
	const resultSet = await transactionsDB.find(params);
	if (resultSet.length) params.ids = resultSet.map(row => row.id);
	// TODO: Remove the check. Send empty response for non-ID based requests
	const response = await coreApi.getTransactions(params);
	if (response.data) transactions.data = response.data.map(tx => normalizeTransaction(tx));
	if (response.meta) transactions.meta = response.meta;

	// TODO: Indexed transactions to blockId
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
