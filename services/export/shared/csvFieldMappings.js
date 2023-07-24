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
	{ label: 'Date', value: 'date' },
	{ label: 'Time', value: 'time' },
	{ label: 'Amount', value: 'amount' },
	{ label: 'Fee', value: 'fee' },
	{ label: 'Amount Token ID', value: 'amountTokenID' },
	{ label: 'Module:Command', value: 'moduleCommand' },
	{ label: 'Sender Address', value: 'senderAddress' },
	{ label: 'Recipient Address', value: 'recipientAddress' },
	{ label: 'Sender Public Key', value: 'senderPublicKey' },
	{ label: 'Recipient Public Key', value: 'recipientPublicKey' },
	{ label: 'Block Height', value: 'blockHeight' },
	{ label: 'Note', value: 'note' },
	{ label: 'Transaction ID', value: 'transactionID' },
	{ label: 'Sending chain ID', value: 'sendingChainID' },
	{ label: 'Receiving chain ID', value: 'receivingChainID' },
];

const metadataMappings = [
	{ label: 'Current chain ID', value: 'currentChainID' },
	{ label: 'Fee token ID', value: 'feeTokenID' },
	{ label: 'Date format', value: 'dateFormat' },
	{ label: 'Time format', value: 'timeFormat' },
	{ label: 'Conversion factor', value: 'conversionFactor' },
	{ label: 'Opening balance', value: 'openingBalance' },
];

module.exports = {
	transactionMappings,
	metadataMappings,
};
