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
	getBase32AddressFromHex,
} = require('../utils/accountUtils');

const {
	getAccountsByAddress,
	getAccountsByPublicKey,
	resolveMultisignatureMemberships,
} = require('../dataService');

const { getAvailableLiskModuleAssets, getAvailableLiskModuleCommands } = require('../constants');

const getTransactionIndexingInfo = async (blocks) => {
	const multisignatureModuleAssetId = '4:0';
	let multisignatureInfoToIndex = [];
	const publicKeysToIndex = [];
	const recipientAddressesToIndex = [];
	const availableLiskModuleAssets = await getAvailableLiskModuleAssets();
	const txnMultiArray = blocks.map(block => {
		const transactions = block.transactions.map(tx => {
			const [{ id }] = availableLiskModuleAssets
				.filter(module => module.id === String(tx.moduleID).concat(':').concat(tx.assetID));
			tx.height = block.height;
			tx.blockId = block.id;
			tx.moduleAssetId = id;
			tx.timestamp = block.timestamp;
			tx.amount = tx.asset.amount || null;
			tx.data = tx.asset.data || null;
			if (tx.asset.recipientAddress) {
				tx.recipientId = getBase32AddressFromHex(tx.asset.recipientAddress);
				recipientAddressesToIndex.push(tx.asset.recipientAddress);
			}
			if (tx.senderPublicKey) publicKeysToIndex.push({ publicKey: tx.senderPublicKey });
			if (tx.moduleAssetId === multisignatureModuleAssetId) {
				multisignatureInfoToIndex = resolveMultisignatureMemberships(tx);
			}
			return tx;
		});
		return transactions;
	});
	let allTransactions = [];
	txnMultiArray.forEach(transactions => allTransactions = allTransactions.concat(transactions));
	const accountsByAddress = await getAccountsByAddress(recipientAddressesToIndex);
	const accountsByPublicKey = await getAccountsByPublicKey(publicKeysToIndex);
	const allAccounts = accountsByAddress.concat(accountsByPublicKey);

	return {
		accounts: allAccounts,
		transactions: allTransactions,
		multisignatureInfoToIndex,
	};
};

const getTransactionIndexingInfoSdkV6 = async (blocks) => {
	const availableLiskModuleAssets = await getAvailableLiskModuleCommands();
	const txnMultiArray = blocks.map(block => {
		const transactions = block.transactions.map(tx => {
			const [{ id }] = availableLiskModuleAssets
				.filter(module => module.id === String(tx.moduleID).concat(':').concat(tx.commandID));
			tx.height = block.height;
			tx.blockId = block.id;
			tx.moduleCommandId = id;
			tx.timestamp = block.timestamp;
			tx.amount = tx.params.amount || null;
			tx.data = tx.params.data || null;
			return tx;
		});
		return transactions;
	});
	let allTransactions = [];
	txnMultiArray.forEach(transactions => allTransactions = allTransactions.concat(transactions));
	return allTransactions;
};

module.exports = {
	getTransactionIndexingInfo,
	getTransactionIndexingInfoSdkV6,
};
