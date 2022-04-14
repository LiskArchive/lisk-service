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
	getVotes,
} = require('../shared/dataService');

module.exports = [
	{
		name: 'votes',
		controller: getVotes,
		params: {
			address: { optional: true, type: 'any' },
			username: { optional: true, type: 'any' },
			publicKey: { optional: true, type: 'any' },
		},
	},
];
