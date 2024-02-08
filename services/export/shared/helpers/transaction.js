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
const { MODULE, COMMAND, TRANSACTION_STATUS } = require('./constants');

const normalizeTransactionAmount = (address, tx, currentChainID) => {
	// Amount normalization is only done for token:transfer & token:transferCrossChain transaction types only
	if (
		![
			`${MODULE.TOKEN}:${COMMAND.TRANSFER}`,
			`${MODULE.TOKEN}:${COMMAND.TRANSFER_CROSS_CHAIN}`,
		].includes(tx.moduleCommand) ||
		tx.executionStatus !== TRANSACTION_STATUS.SUCCESSFUL
	) {
		return null;
	}

	const amount = BigInt(tx.params.amount);

	// Always a deduction for a successful token:transferCrossChain transaction
	if (tx.moduleCommand === `${MODULE.TOKEN}:${COMMAND.TRANSFER_CROSS_CHAIN}`) {
		const sign = tx.params.receivingChainID !== currentChainID ? BigInt('-1') : BigInt('1');
		return (sign * amount).toString();
	}

	const isTokenTransfer = tx.moduleCommand === `${MODULE.TOKEN}:${COMMAND.TRANSFER}`;

	const isRecipient = isTokenTransfer && address === tx.params.recipientAddress;
	const isSelfTransfer = isTokenTransfer && tx.sender.address === tx.params.recipientAddress;
	const { isSelfTokenTransferCredit, isIncomingCrossChainTransferTransaction } = tx;

	const sign =
		(isTokenTransfer && isRecipient && !isSelfTransfer) ||
		(isTokenTransfer && isRecipient && isSelfTransfer && isSelfTokenTransferCredit) ||
		isIncomingCrossChainTransferTransaction
			? BigInt('1')
			: BigInt('-1'); // Outgoing amount reduces the balance

	return (sign * amount).toString();
};

const normalizeTransactionFee = (addressFromParams, tx) => {
	const txFee = (BigInt('-1') * BigInt(tx.fee)).toString(); // Fee reduces the balance

	const isTokenTransfer = tx.moduleCommand === `${MODULE.TOKEN}:${COMMAND.TRANSFER}`;
	if (!isTokenTransfer) return txFee;

	const { isIncomingCrossChainTransferTransaction } = tx;
	const isRecipient = addressFromParams === tx.params.recipientAddress;
	return isRecipient || isIncomingCrossChainTransferTransaction ? BigInt('0').toString() : txFee;
};

const normalizeMessageFee = tx => {
	const { messageFee } = tx.params;
	const normalizedMessageFee = (BigInt('-1') * BigInt(messageFee)).toString(); // Message fee reduces the balance
	return normalizedMessageFee;
};

const checkIfSelfTokenTransfer = tx => {
	const isTokenTransfer = tx.moduleCommand === `${MODULE.TOKEN}:${COMMAND.TRANSFER}`;
	return isTokenTransfer && tx.sender.address === tx.params.recipientAddress;
};

module.exports = {
	normalizeTransactionAmount,
	normalizeTransactionFee,
	normalizeMessageFee,
	checkIfSelfTokenTransfer,
};
