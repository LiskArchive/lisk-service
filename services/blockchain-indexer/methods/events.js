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
	newBlockEvent,
	updateAccountsByAddress,
	deleteBlockEvent,
	newRoundEvent,
} = require('../shared/eventsProcessor');

module.exports = [
	{
		name: 'newBlockEvent',
		controller: async ({ block }) => newBlockEvent(block),
		params: {
			block: { optional: false, type: 'any' },
		},
	},
	{
		name: 'updateAccountsByAddress',
		controller: async ({ accounts }) => updateAccountsByAddress(accounts),
		params: {
			accounts: { optional: false, type: 'any' },
		},
	},
	{
		name: 'deleteBlockEvent',
		controller: async ({ block }) => deleteBlockEvent(block),
		params: {
			block: { optional: false, type: 'any' },
		},
	},
	{
		name: 'newRoundEvent',
		controller: async ({ accounts }) => newRoundEvent(accounts),
		params: {
			accounts: { optional: false, type: 'any' },
		},
	},
];
