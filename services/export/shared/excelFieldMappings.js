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
	{ header: 'Transaction ID', key: 'transactionID' },
	{ header: 'Module:Command', key: 'moduleCommand' },
	{ header: 'Block Height', key: 'blockHeight' },
	{ header: 'Amount', key: 'amount' },
	{ header: 'Amount Token ID', key: 'amountTokenID' },
	{ header: 'Transaction Fee', key: 'fee' },
	{ header: 'Sender Address', key: 'senderAddress' },
	{ header: 'Sender Public Key', key: 'senderPublicKey' },
	{ header: 'Recipient Address', key: 'recipientAddress' },
	{ header: 'Recipient Public Key', key: 'recipientPublicKey' },
	{ header: 'Note', key: 'note' },
	{ header: 'Sending chain ID', key: 'sendingChainID' },
	{ header: 'Receiving chain ID', key: 'receivingChainID' },
];

const metadataMappings = [
	{ header: 'Current chain ID', key: 'currentChainID' },
	{ header: 'Fee token ID', key: 'feeTokenID' },
	{ header: 'Conversion factor', key: 'conversionFactor' },
	{ header: 'Date format', key: 'dateFormat' },
	{ header: 'Time format', key: 'timeFormat' },
	{ header: 'Opening balance', key: 'openingBalance' },
	{ header: 'Legacy balance', key: 'legacyBalance' },
];

module.exports = {
	transactionMappings,
	metadataMappings,
};
