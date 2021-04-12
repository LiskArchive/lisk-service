/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
	getDelegates,
	getActiveDelegates,
	getStandbyDelegates,
	getLatestRegistrations,
	getNextForgers,
} = require('./controllers/delegates');

module.exports = [
	{
		name: 'delegates',
		controller: getDelegates,
		params: {
			anyId: { type: 'any', optional: true },
			address: { type: 'any', optional: true },
			publicKey: { type: 'any', optional: true },
			secondPublicKey: { type: 'any', optional: true },
			username: { type: 'any', optional: true },
			offset: { type: 'any', optional: true },
			limit: { type: 'any', optional: true },
			search: { type: 'any', optional: true },
			sort: { type: 'any', optional: true },
		},
	},
	{
		name: 'delegates.active',
		controller: getActiveDelegates,
		params: {
			limit: { type: 'any', optional: true },
			offset: { type: 'any', optional: true },
		},
	},
	{
		name: 'delegates.standby',
		controller: getStandbyDelegates,
		params: {
			limit: { type: 'any', optional: true },
			offset: { type: 'any', optional: true },
		},
	},
	{
		name: 'delegates.latest_registrations',
		controller: getLatestRegistrations,
		params: {
			limit: { type: 'any', optional: true },
			offset: { type: 'any', optional: true },
		},
	},
	{
		name: 'delegates.next_forgers',
		controller: getNextForgers,
		params: {
			limit: { type: 'any', optional: true },
			offset: { type: 'any', optional: true },
		},
	},
];
