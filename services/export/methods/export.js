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
	scheduleTransactionHistoryExport,
	downloadTransactionHistory,
} = require('./controllers/export');

module.exports = [
	{
		name: 'transactions.export',
		description: 'Schedule transaction history export',
		params: {
			address: { type: 'string', optional: true },
			publicKey: { type: 'string', optional: true },
			interval: { type: 'string', optional: true },
		},
		controller: scheduleTransactionHistoryExport,
	},
	{
		name: 'transactions.csv',
		description: 'Get transaction history',
		params: {
			filename: { type: 'string', optional: false },
		},
		controller: downloadTransactionHistory,
	},
];
