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
	getTokenBalances,
	getTopTokenBalances,
	getTokenSummary,
	tokenHasUserAccount,
	getTokenConstants,
} = require('../controllers/token');

const regex = require('../../../shared/regex');

module.exports = [
	{
		name: 'token.balances',
		controller: getTokenBalances,
		params: {
			address: { optional: false, type: 'string' },
			tokenID: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
		},
	},
	{
		name: 'token.balances.top',
		controller: getTopTokenBalances,
		params: {
			tokenID: { optional: false, type: 'string' },
			sort: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
		},
	},
	{
		name: 'token.summary',
		controller: getTokenSummary,
		params: {
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
		},
	},
	{
		name: 'token.account.exists',
		controller: tokenHasUserAccount,
		params: {
			address: { optional: true, type: 'string', pattern: regex.ADDRESS_LISK32 },
			publicKey: { optional: true, type: 'string', pattern: regex.PUBLIC_KEY },
			name: { optional: true, type: 'string', pattern: regex.NAME },
			tokenID: { optional: false, type: 'string', pattern: regex.TOKEN_ID },
		},
	},
	{
		name: 'token.constants',
		controller: getTokenConstants,
		params: {},
	},
];
