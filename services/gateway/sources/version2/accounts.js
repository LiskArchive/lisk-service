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
const account = require('./mappings/account');

module.exports = {
	type: 'moleculer',
	method: 'indexer.accounts',
	params: {
		address: '=',
		publicKey: '=',
		username: '=',
		isDelegate: '=,boolean',
		status: '=',
		search: '=',
		limit: '=',
		offset: '=',
		sort: '=',
	},
	definition: {
		data: ['data', account],
		meta: {
			count: '=,number',
			offset: '=,number',
			total: '=,number',
		},
		links: {},
	},
};
