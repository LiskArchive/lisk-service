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
const transactionsSource = require('../../../sources/version2/transactions');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');
const { transformParams, response } = require('../../swagger/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions',
	rpcMethod: 'get.transactions',
	tags: ['Transactions'],
	params: {
		id: { optional: true, type: 'string', min: 1, max: 64 },
		moduleAssetId: { optional: true, type: 'string', min: 1, max: 3 },
		moduleAssetName: { optional: true, type: 'string', min: 1 },
		address: { optional: true, type: 'string', min: 38, max: 41 },
		sender: { optional: true, type: 'string', min: 1, max: 74 },
		recipient: { optional: true, type: 'string', min: 1, max: 74 },
		amount: { optional: true, type: 'string', min: 1 },
		timestamp: { optional: true, type: 'string', min: 1, pattern: /([0-9]+|[0-9]+:[0-9]+)/ },
		block: { optional: true, type: 'string', min: 1 },
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
			enum: ['amount:asc', 'amount:desc', 'timestamp:asc', 'timestamp:desc', 'nonce:asc', 'nonce:desc'],
			default: 'timestamp:desc',
		},
	},
	get schema() {
		const transactionSchema = {};
		transactionSchema[this.swaggerApiPath] = { get: {} };
		transactionSchema[this.swaggerApiPath].get.tags = this.tags;
		transactionSchema[this.swaggerApiPath].get.summary = 'Requests transactions data';
		transactionSchema[this.swaggerApiPath].get.description = 'Returns transactions data\n RPC=> get.transactions';
		transactionSchema[this.swaggerApiPath].get.parameters = transformParams('transactions', this.params);
		transactionSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'array of transactions with details',
				schema: {
					type: 'array',
					items: {
						$ref: '#/definitions/TransactionsWithEnvelope',
					},
				},
			},
		};
		Object.assign(transactionSchema[this.swaggerApiPath].get.responses, response);
		return transactionSchema;
	},
	source: transactionsSource,
	envelope,
};
