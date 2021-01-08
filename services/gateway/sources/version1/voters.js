/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const voter = require('../mappings/voter');

module.exports = {
	type: 'moleculer',
	method: 'core.voters',
	params: {
		address: '=,string',
		username: '=,string',
		publicKey: 'publickey,string',
		secondPublicKey: 'secpubkey,string',
		limit: '=,number',
		offset: '=,number',
	},
	definition: {
		data: ['data', voter],
		meta: {
			count: '=,number',
			offset: '=,number',
			total: '=,number',
			address: '=,string',
			publicKey: '=,string',
			username: '=,string',
		},
		links: {},
	},
};
