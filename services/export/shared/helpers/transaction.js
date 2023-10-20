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
const { MODULE, COMMAND } = require('./constants');

const normalizeTransactionAmount = (address, tx) => {
	if (!('amount' in tx.params)) return String(0);

	const isReclaim = tx.moduleCommand === `${MODULE.LEGACY}:${COMMAND.RECLAIM_LSK}`;
	const isTokenTransfer = tx.moduleCommand === `${MODULE.TOKEN}:${COMMAND.TRANSFER}`;

	const isSender = address === tx.sender.address;
	const isRecipient = isTokenTransfer && address === tx.params.recipientAddress;
	const isSelfTransfer = isTokenTransfer && tx.sender.address === tx.params.recipientAddress;
	const { isIncomingCrossChainTransferTransaction } = tx;

	const { isSelfTokenTransferCredit } = tx;
	const sign =
		(isReclaim && isSender) ||
		(isTokenTransfer && isRecipient && !isSelfTransfer) ||
		(isTokenTransfer && isRecipient && isSelfTransfer && isSelfTokenTransferCredit) ||
		isIncomingCrossChainTransferTransaction
			? 1
			: -1;

	return String(sign * tx.params.amount);
};

const normalizeTransactionFee = (address, tx) => {
	const isTokenTransfer = tx.moduleCommand === `${MODULE.TOKEN}:${COMMAND.TRANSFER}`;
	if (!isTokenTransfer) return tx.fee;

	const { isIncomingCrossChainTransferTransaction } = tx;
	const isRecipient = address === tx.params.recipientAddress;
	return isRecipient || isIncomingCrossChainTransferTransaction ? String(0) : tx.fee;
};

const checkIfSelfTokenTransfer = tx => {
	const isTokenTransfer = tx.moduleCommand === `${MODULE.TOKEN}:${COMMAND.TRANSFER}`;
	return isTokenTransfer && tx.sender.address === tx.params.recipientAddress;
};

module.exports = {
	normalizeTransactionAmount,
	normalizeTransactionFee,
	checkIfSelfTokenTransfer,
};
