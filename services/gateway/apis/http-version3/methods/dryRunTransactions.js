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
const dryRunTransactionsSource = require('../../../sources/version3/dryRunTransactions');
const { getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions/dryrun',
	httpMethod: 'POST',
	rpcMethod: 'post.transactions.dryrun',
	tags: ['Transactions'],
	params: {
		transaction: { optional: false, type: 'any' },
		isSkipVerify: { optional: true, type: 'boolean', default: false },
	},
	get schema() {
		const dryRunTransactionSchema = {};
		dryRunTransactionSchema[this.swaggerApiPath] = { post: {} };
		dryRunTransactionSchema[this.swaggerApiPath].post.tags = this.tags;
		dryRunTransactionSchema[this.swaggerApiPath].post.summary = 'Dry run transactions.';
		dryRunTransactionSchema[this.swaggerApiPath].post.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Dry run transactions.',
		});
		dryRunTransactionSchema[this.swaggerApiPath].post.parameters = [{ $ref: '#/parameters/dryrunTransaction' }];
		dryRunTransactionSchema[this.swaggerApiPath].post.responses = {
			200: {
				description: 'Dry run transactions',
				schema: {
					$ref: '#/definitions/dryTransactionWithEnvelope',
				},
			},
			400: {
				description: 'Bad request',
				schema: {
					$ref: '#/definitions/badRequest',
				},
			},
			500: {
				description: 'Internal server error',
				schema: {
					$ref: '#/definitions/serverErrorEnvelope',
				},
			},
		};
		return dryRunTransactionSchema;
	},
	source: dryRunTransactionsSource,
};
