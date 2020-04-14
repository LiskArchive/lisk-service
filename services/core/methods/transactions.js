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
} = require('./controllers/transactions');

module.exports = [
	{
		name: 'transactions',
		controller: getTransactions,
		params: {
			id: {},
			type: {},
			senderIdOrRecipientId: {},
			senderId: {},
			recipientId: {},
			offset: {},
			limit: {},
			minAmount: {},
			maxAmount: {},
			fromTimestamp: {},
			toTimestamp: {},
			blockId: {},
			height: {},
			sort: {},
		},
	},
	{
		name: 'transactions.last',
		controller: getLastTransactions,
		params: {
			limit: {},
			offset: {},
		},
	},
	{
		name: 'transactions.statistics.day',
		controller: getTransactionsStatisticsDay,
		params: {
			limit: {},
			offset: {},
		},
	},
	{
		name: 'transactions.statistics.month',
		controller: getTransactionsStatisticsMonth,
		params: {
			limit: {},
			offset: {},
		},
	},
];
