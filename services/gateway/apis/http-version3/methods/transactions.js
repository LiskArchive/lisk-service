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
const transactionsSource = require('../../../sources/version3/transactions');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions',
	rpcMethod: 'get.transactions',
	tags: ['Transactions'],
	params: {
		transactionID: { optional: true, type: 'string', min: 1, max: 64 },
		moduleCommandID: { optional: true, type: 'string', min: 1, max: 21 },
		moduleCommandName: { optional: true, type: 'string', min: 1 },
		address: { optional: true, type: 'string', min: 38, max: 41, pattern: /^lsk[a-hjkm-z2-9]{38}$/ },
		senderAddress: { optional: true, type: 'string', min: 3, max: 41, pattern: /^lsk[a-hjkm-z2-9]{38}$/ },
		senderPublicKey: { optional: true, type: 'string', min: 64, max: 64, pattern: /^([A-Fa-f0-9]{2}){32}$/ },
		recipientAddress: { optional: true, type: 'string', min: 3, max: 41, pattern: /^lsk[a-hjkm-z2-9]{38}$/ },
		recipientPublicKey: { optional: true, type: 'string', min: 64, max: 64, pattern: /^([A-Fa-f0-9]{2}){32}$/ },
		amount: { optional: true, type: 'string', min: 1, pattern: /([0-9]+|[0-9]+:[0-9]+)/ },
		timestamp: { optional: true, type: 'string', min: 1, pattern: /([0-9]+|[0-9]+:[0-9]+)/ },
		nonce: { optional: true, type: 'string', min: 1 },
		blockID: { optional: true, type: 'string', min: 1 },
		height: { optional: true, type: 'string', min: 1 },
		search: { optional: true, type: 'string' },
		data: { optional: true, type: 'string' },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		includePending: { optional: true, type: 'boolean', default: false },
		sort: {
			optional: true,
			type: 'string',
			min: 1,
			enum: ['amount:asc', 'amount:desc', 'timestamp:asc', 'timestamp:desc'],
			default: 'timestamp:desc',
		},
	},
	source: transactionsSource,
	envelope,
};
