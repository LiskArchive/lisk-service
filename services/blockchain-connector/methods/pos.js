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
	getDelegate,
	getAllDelegates,
	getPosConstants,
	getPosLockedRewards,
	getStaker,
	getPosPendingUnlocks,
	getPosClaimableRewards,
} = require('../shared/sdk');

module.exports = [
	{
		name: 'getDelegate',
		controller: async ({ address }) => getDelegate(address),
		params: {
			address: { optional: false, type: 'string' },
		},
	},
	{
		name: 'getAllDelegates',
		controller: async () => getAllDelegates(),
		params: {},
	},
	{
		name: 'getPosConstants',
		controller: async () => getPosConstants(),
		params: {},
	},
	{
		name: 'getPosPendingUnlocks',
		controller: async ({ address }) => getPosPendingUnlocks(address),
		params: {
			address: { optional: true, type: 'string' },
		},
	},
	{
		name: 'getStaker',
		controller: async ({ address }) => getStaker(address),
		params: {
			address: { optional: false, type: 'string' },
		},
	},
	{
		name: 'getPosClaimableRewards',
		controller: async ({ address }) => getPosClaimableRewards({ address }),
		params: {
			address: { optional: false, type: 'string' },
		},
	},
	{
		name: 'getPosLockedRewards',
		controller: async ({ address, tokenID }) => getPosLockedRewards({ address, tokenID }),
		params: {
			address: { optional: false, type: 'string' },
			tokenID: { optional: false, type: 'string' },
		},
	},
];
