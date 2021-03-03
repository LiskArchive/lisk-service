/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
} = require('./controllers/transactions');

module.exports = [
	{
		name: 'transactions',
		controller: getTransactions,
		params: {
			id: { type: 'any', optional: true },
			type: { type: 'any', optional: true },
			senderIdOrRecipientId: { type: 'any', optional: true },
			senderId: { type: 'any', optional: true },
			recipientId: { type: 'any', optional: true },
			offset: { type: 'any', optional: true },
			limit: { type: 'any', optional: true },
			minAmount: { type: 'any', optional: true },
			maxAmount: { type: 'any', optional: true },
			fromTimestamp: { type: 'any', optional: true },
			toTimestamp: { type: 'any', optional: true },
			blockId: { type: 'any', optional: true },
			height: { type: 'any', optional: true },
			sort: { type: 'any', optional: true },
		},
	},
	{
		name: 'transactions.last',
		controller: getLastTransactions,
		params: {
			limit: { type: 'any', optional: true },
			offset: { type: 'any', optional: true },
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
		params: {},
	},
];
