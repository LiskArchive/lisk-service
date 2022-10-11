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
	getTransactions,
	getPendingTransactions,
	postTransactions,
	getCommandsParamsSchemas,
	dryRunTransactions,
} = require('./controllers/transactions');

module.exports = [
	{
		name: 'transactions',
		controller: getTransactions,
		params: {
			transactionID: { optional: true, type: 'string' },
			moduleCommand: { optional: true, type: 'string' },
			address: { optional: true, type: 'string' },
			senderAddress: { optional: true, type: 'string' },
			recipientAddress: { optional: true, type: 'string' },
			timestamp: { optional: true, type: 'string' },
			nonce: { optional: true, type: 'string' },
			blockID: { optional: true, type: 'string' },
			height: { optional: true, type: 'string' },
			search: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
			executionStatus: { optional: true, type: 'string' },
			sort: { optional: true, type: 'string' },
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
			transaction: { optional: true, type: 'string' },
		},
	},
	{
		name: 'commands.parameters.schemas',
		controller: getCommandsParamsSchemas,
		params: {
			moduleCommand: { optional: true, type: 'string' },
		},
	},
	{
		name: 'transactions.dry.run',
		controller: dryRunTransactions,
		params: {
			transaction: { optional: true, type: 'string' },
		},
	},
];
