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
	getVoters,
} = require('./controllers/voters');

module.exports = [
	{
		name: 'voters',
		controller: getVoters,
		params: {
			address: { optional: true, type: 'string', min: 3, max: 41 },
			username: { optional: true, type: 'string', min: 3, max: 20 },
			publicKey: { optional: true, type: 'string', min: 64, max: 64 },
			limit: { optional: true, type: 'number', min: 1, max: 100, default: 10, integer: true, pattern: /^\b((?:[1-9][0-9]?)|100)\b$/ },
			offset: { optional: true, type: 'number', min: 0, default: 0, integer: true, pattern: /^\b([0-9][0-9]*)\b$/ },
		},
	},
];
