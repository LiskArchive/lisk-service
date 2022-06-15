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
	getAccounts,
	getGenerators,
	getLegacyAccountInfo,
} = require('./controllers/accounts');

const {
	reloadDelegateCache,
} = require('../../shared/dataService');

module.exports = [
	{
		name: 'accounts',
		controller: getAccounts,
		params: {
			address: { optional: true, type: 'any' },
			publicKey: { optional: true, type: 'any' },
			username: { optional: true, type: 'any' },
			isDelegate: { optional: true, type: 'any' },
			status: { optional: true, type: 'any' },
			search: { optional: true, type: 'any' },
			limit: { optional: true, type: 'any' },
			offset: { optional: true, type: 'any' },
			sort: { optional: true, type: 'any' },

		},
	},
	{
		name: 'generators',
		controller: getGenerators,
		params: {
			limit: { type: 'any', optional: true },
			offset: { type: 'any', optional: true },
		},
	},
	{
		name: 'delegates.reload',
		controller: reloadDelegateCache,
		params: {},
	},
	{
		name: 'legacy',
		controller: getLegacyAccountInfo,
		params: {
			publicKey: { optional: false, type: 'string' },
		},
	},
];
