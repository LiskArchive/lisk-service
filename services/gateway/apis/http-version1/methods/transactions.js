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
const transactionsSource = require('../../../sources/transactions');
const envelope = require('../../../sources/mappings/stdEnvelope');
const { transformParams, response } = require('../swagger/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions',
	rpcMethod: 'get.transactions',
	tags: ['Transactions'],
	params: {
		id: { optional: true, type: 'string', min: 1 },
		type: { optional: true, type: 'number', integer: true, min: 0 },
		address: { optional: true, type: 'string', min: 1 },
		sender: { optional: true, type: 'string', min: 1 },
		recipient: { optional: true, type: 'string', min: 1 },
		min: { optional: true, type: 'string', min: 1 },
		max: { optional: true, type: 'string', min: 1 },
		from: { optional: true, type: 'string', min: 1 },
		to: { optional: true, type: 'string', min: 1 },
		block: { optional: true, type: 'string', min: 1 },
		height: { optional: true, type: 'string', min: 1 },
		limit: { optional: true, type: 'number', min: 1, max: 100 },
		offset: { optional: true, type: 'number', min: 0 },
		sort: {
			optional: true,
			type: 'string',
			min: 1,
			enum: [
				'amount:asc', 'amount:desc', 'fee:asc', 'fee:desc',
				'type:asc', 'type:desc', 'timestamp:asc', 'timestamp:desc',
			],
			default: 'amount:asc',
		},
	},
	get schema() {
		const transactionSchema = {};
		transactionSchema[this.swaggerApiPath] = { get: {} };
		transactionSchema[this.swaggerApiPath].get.tags = this.tags;
		transactionSchema[this.swaggerApiPath].get.summary = 'Requests transactions data';
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
