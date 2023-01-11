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
	getTokens,
	getTokensSummary,
} = require('../controllers/token');

module.exports = [
	{
		name: 'tokens',
		controller: getTokens,
		params: {
			address: { optional: false, type: 'string' },
			tokenID: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
		},
	},
	{
		name: 'tokens.summary',
		controller: getTokensSummary,
		params: {
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
		},
	},
];
