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
const {
	MODULE_COMMAND_TOKEN_TRANSFER,
	MODULE_COMMAND_RECLAIM_TRANSACTION,
} = require('./constants');

const normalizeTransactionAmount = (address, tx) => {
	if (!('amount' in tx.params)) return 0;

	const isReclaim = tx.moduleCommand === MODULE_COMMAND_RECLAIM_TRANSACTION;
	const isTokenTransfer = tx.moduleCommand === MODULE_COMMAND_TOKEN_TRANSFER;

	const isSender = address === tx.sender.address;
	const isRecipient = isTokenTransfer && address === tx.params.recipientAddress;
	const isSelfTransfer = isTokenTransfer && tx.sender.address === tx.params.recipientAddress;

	const { isSelfTokenTransferCredit } = tx;
	const sign = (isReclaim && isSender)
		|| (isTokenTransfer && isRecipient && !isSelfTransfer)
		|| (isTokenTransfer && isRecipient && isSelfTransfer && isSelfTokenTransferCredit)
		? 1 : -1;

	return sign * tx.params.amount;
};

const normalizeTransactionFee = (address, tx) => {
	const isTokenTransfer = tx.moduleCommand === MODULE_COMMAND_TOKEN_TRANSFER;
	if (!isTokenTransfer) return tx.fee;

	const isRecipient = address === tx.params.recipientAddress;
	return isRecipient ? 0 : tx.fee;
};

const checkIfSelfTokenTransfer = (tx) => {
	const isTokenTransfer = tx.moduleCommand === MODULE_COMMAND_TOKEN_TRANSFER;
	return isTokenTransfer && tx.sender.address === tx.params.recipientAddress;
};

module.exports = {
	normalizeTransactionAmount,
	normalizeTransactionFee,
	checkIfSelfTokenTransfer,
};
