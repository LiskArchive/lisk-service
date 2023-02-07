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
const posStaker = require('./mappings/posStaker');

module.exports = {
	type: 'moleculer',
	method: 'indexer.pos.stakers',
	params: {
		address: '=,string',
		publicKey: '=,string',
		name: '=,string',
		search: '=,string',
		limit: '=,number',
		offset: '=,number',
	},
	definition: {
		data: {
			stakers: ['data.stakers', posStaker],
		},
		meta: {
			validator: {
				address: '=,string',
				publicKey: '=,string',
				name: '=,string',
			},
			count: '=,number',
			offset: '=,number',
			total: '=,number',
		},
	},
};
