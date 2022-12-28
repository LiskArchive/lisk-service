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
const posStake = require('./mappings/posStake');

module.exports = {
	type: 'moleculer',
	method: 'indexer.pos.stakes',
	params: {
		address: '=,string',
		publicKey: '=,string',
		name: '=,string',
	},
	definition: {
		data: {
			stakes: ['data.stakes', posStake],
		},
		meta: {
			staker: {
				address: '=,string',
				publicKey: '=,string',
				name: '=,string',
			},
			count: '=,number',
		},
	},
};
