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
	getLastTransactions,
	getTransactionsStatisticsDay,
	getTransactionsStatisticsMonth,
	getPendingTransactions,
	postTransactions,
	getTransactionsSchemas,
} = require('./controllers/transactions');

module.exports = [
	{
		name: 'transactions',
		controller: getTransactions,
		params: {
			transactionId: { optional: true, type: 'string', min: 1, max: 64 },
			moduleAssetId: { optional: true, type: 'string', min: 1, max: 3 },
			moduleAssetName: { optional: true, type: 'string', min: 1 },
			address: { optional: true, type: 'string', min: 38, max: 41, pattern: /^lsk([a-hjkm-z]|[2-9]){38}$/ },
			senderAddress: { optional: true, type: 'string', min: 3, max: 41, pattern: /^lsk([a-hjkm-z]|[2-9]){38}$/ },
			senderPublicKey: { optional: true, type: 'string', min: 64, max: 64, pattern: /^([A-Fa-f0-9]{2}){32}$/ },
			senderUsername: { optional: true, type: 'string', min: 1, max: 20, pattern: /^[a-z0-9!@$&_.]{1,20}$/ },
			recipientAddress: { optional: true, type: 'string', min: 3, max: 41, pattern: /^lsk([a-hjkm-z]|[2-9]){38}$/ },
			recipientPublicKey: { optional: true, type: 'string', min: 64, max: 64, pattern: /^([A-Fa-f0-9]{2}){32}$/ },
			recipientUsername: { optional: true, type: 'string', min: 1, max: 20, pattern: /^[a-z0-9!@$&_.]{1,20}$/ },
			amount: { optional: true, type: 'string', min: 1, pattern: /([0-9]+|[0-9]+:[0-9]+)/ },
			timestamp: { optional: true, type: 'string', min: 1, pattern: /([0-9]+|[0-9]+:[0-9]+)/ },
			nonce: { optional: true, type: 'string', min: 1 },
			block: { optional: true, type: 'string', min: 1 },
			height: { optional: true, type: 'string', min: 1 },
			search: { optional: true, type: 'string' },
			data: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
			offset: { optional: true, type: 'number', min: 0, default: 0 },
			includePending: { optional: true, type: 'boolean', default: false },
			sort: {
				optional: true,
				type: 'string',
				min: 1,
				enum: ['amount:asc', 'amount:desc', 'timestamp:asc', 'timestamp:desc'],
				default: 'timestamp:desc',
			},
		},
	},
	{
		name: 'transactions.statistics.day',
		controller: getTransactionsStatisticsDay,
		params: {
			limit: { type: 'any', optional: true },
			offset: { type: 'any', optional: true },
		},
	},
	{
		name: 'transactions.statistics.month',
		controller: getTransactionsStatisticsMonth,
		params: {
			limit: { type: 'any', optional: true },
			offset: { type: 'any', optional: true },
		},
	},
	{
		name: 'transactions.pending',
		controller: getPendingTransactions,
		params: {},
	},
	{
		name: 'transactions.post',
		controller: postTransactions,
		params: {
			transaction: { type: 'string', optional: false },
		},
	},
	{
		name: 'transactions.schemas',
		controller: getTransactionsSchemas,
		params: {
			moduleAssetId: { optional: true, type: 'string', min: 3, pattern: /[0-9]+:[0-9]+/ },
			moduleAssetName: { optional: true, type: 'string', min: 3, pattern: /[a-z]+:[a-z]+/ },
		},
	},
];
