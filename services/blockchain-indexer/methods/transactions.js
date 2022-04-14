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
	getTransactions,
	getPendingTransactions,
	postTransactions,
	getTransactionsSchemas,
} = require('../shared/dataService');

module.exports = [
	{
		name: 'getTransactions',
		controller: getTransactions,
		params: {
			transactionId: { optional: true, type: 'any' },
			moduleAssetId: { optional: true, type: 'any' },
			moduleAssetName: { optional: true, type: 'any' },
			address: { optional: true, type: 'any' },
			senderAddress: { optional: true, type: 'any' },
			senderPublicKey: { optional: true, type: 'any' },
			senderUsername: { optional: true, type: 'any' },
			recipientAddress: { optional: true, type: 'any' },
			recipientPublicKey: { optional: true, type: 'any' },
			recipientUsername: { optional: true, type: 'any' },
			amount: { optional: true, type: 'any' },
			timestamp: { optional: true, type: 'any' },
			nonce: { optional: true, type: 'any' },
			blockId: { optional: true, type: 'any' },
			height: { optional: true, type: 'any' },
			search: { optional: true, type: 'any' },
			data: { optional: true, type: 'any' },
			limit: { optional: true, type: 'any' },
			offset: { optional: true, type: 'any' },
			includePending: { optional: true, type: 'any' },
			sort: { optional: true, type: 'any' },
		},
	},
	{
		name: 'getPendingTransactions',
		controller: getPendingTransactions,
		params: {},
	},
	{
		name: 'postTransactions',
		controller: postTransactions,
		params: {
			transaction: { optional: true, type: 'any' },
		},
	},
	{
		name: 'getTransactionsSchemas',
		controller: getTransactionsSchemas,
		params: {
			moduleAssetId: { optional: true, type: 'any' },
			moduleAssetName: { optional: true, type: 'any' },
		},
	},
];
