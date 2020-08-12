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
const peer = require('./mappings/peer');

module.exports = {
	type: 'moleculer',
	method: 'core.peers',
	params: {
		ip: '=,string',
		httpPort: '=,string',
		wsPort: '=,string',
		os: '=,string',
		version: '=,string',
		state: '=,string',
		height: '=,number',
		broadhash: '=',
		limit: '=,number',
		offset: '=,number',
		sort: '=,string',
	},
	definition: {
		data: ['data', peer],
		meta: {
			count: '=,number',
			offset: '=,number',
			total: '=,number',
		},
		links: {},
	},
};
