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
	dryRunTransaction,
} = require('../shared/sdk/endpoints');

module.exports = [
	{
		name: 'getTransactionByID',
		controller: async ({ id }) => getTransactionByID(id),
		params: {
			id: { optional: false, type: 'string' },
		},
	},
	{
		name: 'getTransactionsByIDs',
		controller: async ({ ids }) => getTransactionsByIDs(ids),
		params: {
			ids: { optional: false, type: 'array', items: 'string' },
		},
	},
	{
		name: 'getTransactionsFromPool',
		controller: getTransactionsFromPool,
		params: {},
	},
	{
		name: 'postTransaction',
		controller: async ({ transaction }) => postTransaction(transaction),
		params: {
			transaction: { optional: false, type: 'string' },
		},
	},
	{
		name: 'dryRunTransaction',
		controller: async ({ transaction }) => dryRunTransaction(transaction),
		params: {
			transaction: { optional: false, type: 'string' },
		},
	},
];
