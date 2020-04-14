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
	getAccounts,
	getTopAccounts,
	getVotes,
	getVoters,
} = require('./controllers/accounts');

module.exports = [
	{
		name: 'accounts',
		controller: getAccounts,
		method: 'GET',
		params: {
			anyId: { required: false },
			address: { required: false },
			publicKey: { required: false },
			secondPublicKey: { required: false },
			username: { required: false },
			limit: { required: false },
			offset: { required: false },
			sort: { required: false },
		},
	},
	{
		name: 'accounts.top',
		controller: getTopAccounts,
		method: 'GET',
		params: {
			limit: { required: false },
			offset: { required: false },
		},
	},
	{
		name: 'accounts.votes',
		controller: getVotes,
		method: 'GET',
		params: {
			anyId: { required: true },
			limit: { required: false },
			offset: { required: false },
		},
	},
	{
		name: 'accounts.voters',
		controller: getVoters,
		method: 'GET',
		params: {
			anyId: { required: true },
			limit: { required: false },
			offset: { required: false },
		},
	},
];
