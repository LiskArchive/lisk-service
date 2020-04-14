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
			anyId: { required: false },
			address: { required: false },
			publicKey: { required: false },
			secondPublicKey: { required: false },
			username: { required: false },
			offset: { required: false },
			limit: { required: false },
			search: { required: false },
			sort: { required: false },
		},
	},
	{
		name: 'delegates.active',
		controller: getActiveDelegates,
		params: {
			limit: { required: false },
			offset: { required: false },
		},
	},
	{
		name: 'delegates.standby',
		controller: getStandbyDelegates,
		params: {
			limit: { required: false },
			offset: { required: false },
		},
	},
	{
		name: 'delegates.latest_registrations',
		controller: getLatestRegistrations,
		params: {
			limit: { required: false },
			offset: { required: false },
		},
	},
	{
		name: 'delegates.next_forgers',
		controller: getNextForgers,
		params: {
			limit: { required: false },
			offset: { required: false },
		},
	},
];
