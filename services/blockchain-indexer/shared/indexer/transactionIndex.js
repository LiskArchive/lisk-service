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
const { getBase32AddressFromHex } = require('../utils/accountUtils');
const { getAvailableModuleCommands } = require('../constants');

const getTransactionIndexingInfo = async (blocks) => {
	const availableModuleCommands = await getAvailableModuleCommands();
	const txnMultiArray = blocks.map(block => {
		const transactions = block.transactions.map(tx => {
			const { id } = availableModuleCommands
				.find(module => module.id === String(tx.moduleID).concat(':', tx.commandID));
			tx.height = block.height;
			tx.blockId = block.id;
			tx.moduleCommandId = id;
			tx.timestamp = block.timestamp;
			tx.amount = tx.params.amount || null;
			tx.data = tx.params.data || null;
			if (tx.params.recipientAddress) {
				tx.recipientId = getBase32AddressFromHex(tx.params.recipientAddress);
			}
			return tx;
		});
		return transactions;
	});
	const allTransactions = txnMultiArray.flat();
	return allTransactions;
};

module.exports = {
	getTransactionIndexingInfo,
};
