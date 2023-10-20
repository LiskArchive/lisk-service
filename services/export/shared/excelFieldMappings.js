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
const transactionMappings = [
	{ header: 'Date', key: 'date' },
	{ header: 'Time', key: 'time' },
	{ header: 'Block Height', key: 'blockHeight' },
	{ header: 'Block Reward', key: 'blockReward' },
	{ header: 'Block Reward Token ID', key: 'rewardTokenID' },
	{ header: 'Transaction ID', key: 'transactionID' },
	{ header: 'Module:Command', key: 'moduleCommand' },
	{ header: 'Transaction Fee', key: 'fee' },
	{ header: 'Transaction Fee Token ID', key: 'txFeeTokenID' },
	{ header: 'Amount', key: 'amount' },
	{ header: 'Amount Token ID', key: 'amountTokenID' },
	{ header: 'Message Fee', key: 'messageFee' },
	{ header: 'Message Fee Token ID', key: 'messageFeeTokenID' },
	{ header: 'Sender Address', key: 'senderAddress' },
	{ header: 'Sender Public Key', key: 'senderPublicKey' },
	{ header: 'Recipient Address', key: 'recipientAddress' },
	{ header: 'Recipient Public Key', key: 'recipientPublicKey' },
	{ header: 'Reward Amount', key: 'rewardAmount' },
	{ header: 'Reward Token ID', key: 'rewardTokenID' },
	{ header: 'Note', key: 'note' },
	{ header: 'Sending Chain ID', key: 'sendingChainID' },
	{ header: 'Receiving Chain ID', key: 'receivingChainID' },
];

const metadataMappings = [
	{ header: 'Chain ID', key: 'chainID' },
	{ header: 'Chain Name', key: 'chainName' },
	{ header: 'Opening Balance', key: 'openingBalance' },
	{ header: 'Note', key: 'note' },
];

module.exports = {
	transactionMappings,
	metadataMappings,
};
