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
const { getAccount, getAccounts } = require('../shared/sdk/actions');
const { getNumberOfGenesisAccounts, getGenesisAccounts } = require('../shared/sdk/genesisBlock');

module.exports = [
	{
		name: 'getAccount',
		controller: async ({ address }) => getAccount(address),
		params: {
			address: { optional: false, type: 'string' },
		},
	},
	{
		name: 'getAccounts',
		controller: async ({ addresses }) => getAccounts(addresses),
		params: {
			addresses: { optional: false, type: 'array', items: 'string' },
		},
	},
	{
		name: 'getNumberOfGenesisAccounts',
		controller: getNumberOfGenesisAccounts,
		params: {},
	},
	{
		name: 'getGenesisAccounts',
		controller: async ({ limit, offset }) => getGenesisAccounts(limit, offset),
		params: {
			limit: { optional: true, type: 'number', min: 1, max: 100, default: 100 },
			offset: { optional: true, type: 'number', min: 0, default: 0 },
		},
	},
];
