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
const transactionsSource = require('../../../sources/version2/postTransactions');
const { transformParams, response } = require('../../swagger/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions',
	httpMethod: 'POST',
	rpcMethod: 'post.transactions',
	tags: ['Transactions'],
	params: {
		transaction: { optional: false, type: 'string', min: 1, pattern: /^\b[0-9a-fA-F]+\b$/ },
	},
	get schema() {
		const transactionSchema = {};
		transactionSchema[this.swaggerApiPath] = { post: {} };
		transactionSchema[this.swaggerApiPath].post.tags = this.tags;
		transactionSchema[this.swaggerApiPath].post.summary = 'Post transactions';
		transactionSchema[this.swaggerApiPath].post.description = 'Post transactions and return transactionID';
		transactionSchema[this.swaggerApiPath].post.parameters = transformParams('transactions', this.params);
		transactionSchema[this.swaggerApiPath].post.responses = {
			200: {
				description: 'Broadcast transaction',
				schema: {
					type: 'object',
					properties: {
						message: {
							$ref: '#/definitions/message',
						},
						transacitionId: {
							$ref: '#/definitions/transactionId',
						},
					},
				},
			},
		};
		Object.assign(transactionSchema[this.swaggerApiPath].post.responses, response);
		return transactionSchema;
	},
	source: transactionsSource,
};
