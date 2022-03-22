/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
	getTransactionByID,
	getTransactionsByIDs,
	getTransactionsFromPool,
	postTransaction,
} = require('./controllers/transactions');

module.exports = [
	{
		name: 'getTransactionByID',
		controller: getTransactionByID,
		params: {
			id: { optional: false, type: 'any' },
		},
	},
	{
		name: 'getTransactionsByIDs',
		controller: getTransactionsByIDs,
		params: {
			ids: { optional: false, type: 'any' },
		},
	},
	{
		name: 'getTransactionsFromPool',
		controller: getTransactionsFromPool,
		params: {},
	},
	{
		name: 'postTransaction',
		controller: postTransaction,
		params: {
			transaction: { optional: false, type: 'any' },
		},
	},
];
