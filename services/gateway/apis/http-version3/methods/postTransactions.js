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
const postTransactionsSource = require('../../../sources/version3/postTransactions');
const { transformParams, getSwaggerDescription } = require('../../../shared/utils');

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
		const postTransactionSchema = {};
		postTransactionSchema[this.swaggerApiPath] = { post: {} };
		postTransactionSchema[this.swaggerApiPath].post.tags = this.tags;
		postTransactionSchema[this.swaggerApiPath].post.summary = 'Post transactions';
		postTransactionSchema[this.swaggerApiPath].post.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Post transactions and return transactionID',
		});
		postTransactionSchema[this.swaggerApiPath].post.parameters = transformParams('transactions', this.params);
		postTransactionSchema[this.swaggerApiPath].post.responses = {
			200: {
				description: 'Broadcast transaction',
				schema: {
					$ref: '#/definitions/postTransactionWithEnvelope',
				},
			},
			400: {
				description: 'Bad request',
				schema: {
					$ref: '#/definitions/badRequestEnvelope',
				},
			},
			500: {
				description: 'Internal server error',
				schema: {
					$ref: '#/definitions/serverErrorEnvelope',
				},
			},
		};
		return postTransactionSchema;
	},
	source: postTransactionsSource,
};
