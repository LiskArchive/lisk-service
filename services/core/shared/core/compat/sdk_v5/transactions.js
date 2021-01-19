/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
// const BluebirdPromise = require('bluebird');
const coreApi = require('./coreApi');
// const { getBlocks } = require('./blocks');
const { getRegisteredModules } = require('../common');

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
	const transactions = {
		data: [],
		meta: {},
	};

	const response = await coreApi.getTransactions(params);
	if (response.data) transactions.data = response.data.map(tx => normalizeTransaction(tx));
	if (response.meta) transactions.meta = response.meta;

	// TODO: Indexed transactions to blockId
	// transactions.data = await BluebirdPromise.map(
	// 	transactions.data,
	// 	async transaction => {
	// 		const txBlock = (await getBlocks({ id: transaction.id })).data[0];
	// 		transaction.unixTimestamp = txBlock.timestamp;
	// 		return transaction;
	// 	},
	// 	{ concurrency: transactions.data.length },
	// );

	transactions.meta.total = transactions.meta.count;
	transactions.meta.count = transactions.data.length;
	transactions.meta.offset = params.offset || 0;
	return transactions;
};

const getPendingTransactions = async () => {
	const pendingTx = await coreApi.getPendingTransactions();
	return pendingTx;
};

module.exports = {
	getTransactions,
	getPendingTransactions,
};
