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
const transaction = require('./mappings/transaction');

module.exports = {
	type: 'moleculer',
	method: 'core.transactions',
	params: {
		id: '=',
		type: '=',
		senderIdOrRecipientId: 'address',
		senderId: 'sender',
		recipientId: 'recipient',
		offset: '=',
		limit: '=',
		minAmount: 'min',
		maxAmount: 'max',
		fromTimestamp: 'from',
		toTimestamp: 'to',
		blockId: 'block',
		height: '=',
		sort: '=',
		data: '=',
	},
	definition: {
		data: ['data', transaction],
		meta: {
			count: '=,number',
			offset: '=,number',
			total: '=,number',
		},
		links: {},
	},
};
