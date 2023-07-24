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
	{ header: 'Amount', key: 'amount' },
	{ header: 'Fee', key: 'fee' },
	{ header: 'Amount Token ID', key: 'amountTokenID' },
	{ header: 'Module:Command', key: 'moduleCommand' },
	{ header: 'Sender Address', key: 'senderAddress' },
	{ header: 'Recipient Address', key: 'recipientAddress' },
	{ header: 'Sender Public Key', key: 'senderPublicKey' },
	{ header: 'Recipient Public Key', key: 'recipientPublicKey' },
	{ header: 'Block Height', key: 'blockHeight' },
	{ header: 'Note', key: 'note' },
	{ header: 'Transaction ID', key: 'transactionID' },
	{ header: 'Sending chain ID', key: 'sendingChainID' },
	{ header: 'Receiving chain ID', key: 'receivingChainID' },
];

const metadataMappings = [
	{ header: 'Current chain ID', key: 'currentChainID' },
	{ header: 'Fee token ID', key: 'feeTokenID' },
	{ header: 'Date format', key: 'dateFormat' },
	{ header: 'Time format', key: 'timeFormat' },
	{ header: 'Conversion factor', key: 'conversionFactor' },
	{ header: 'Opening balance', key: 'openingBalance' },
	{ header: 'Legacy balance', key: 'legacyBalance' },
];

module.exports = {
	transactionMappings,
	metadataMappings,
};
