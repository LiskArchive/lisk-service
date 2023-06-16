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
const events = require('./mappings/event');

module.exports = {
	type: 'moleculer',
	method: 'indexer.events',
	params: {
		transactionID: '=,string',
		senderAddress: '=,string',
		topic: '=,string',
		blockID: '=,string',
		height: '=,string',
		timestamp: '=,string',
		limit: '=,number',
		offset: '=,number',
		sort: '=,string',
		order: '=,string',
	},
	definition: {
		data: ['data', events],
		meta: {
			count: '=,number',
			offset: '=,number',
			total: '=,number',
		},
	},
};
