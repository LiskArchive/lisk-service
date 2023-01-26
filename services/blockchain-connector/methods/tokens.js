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
	checkUserAccountExistsForToken,
	getEscrowedAmounts,
	getSupportedTokens,
	getTotalSupply,
	getTokenBalance,
	getTokenBalances,
} = require('../shared/sdk');

module.exports = [
	{
		name: 'getTokenBalance',
		controller: async ({ address, tokenID }) => getTokenBalance({ address, tokenID }),
		params: {
			address: { optional: false, type: 'string' },
			tokenID: { optional: false, type: 'string' },
		},
	},
	{
		name: 'getTokenBalances',
		controller: async ({ address }) => getTokenBalances(address),
		params: {
			address: { optional: false, type: 'string' },
		},
	},
	{
		name: 'getEscrowedAmounts',
		controller: async () => getEscrowedAmounts(),
		params: {},
	},
	{
		name: 'getSupportedTokens',
		controller: async () => getSupportedTokens(),
		params: {},
	},
	{
		name: 'getTotalSupply',
		controller: async () => getTotalSupply(),
		params: {},
	},
	{
		name: 'checkUserAccountExistsForToken',
		controller: async ({ address, tokenID }) => checkUserAccountExistsForToken({
			address,
			tokenID,
		}),
		params: {
			address: { optional: false, type: 'string' },
			tokenID: { optional: false, type: 'string' },
		},
	},

];
