/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const transactionsCalculateFeesSource = require('../../../sources/version3/transactionsCalculateFees');
const { getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions/calculate-fees',
	httpMethod: 'POST',
	rpcMethod: 'post.transactions.calculate-fees',
	tags: ['Transactions'],
	params: {
		transaction: [
			{ optional: false, type: 'string' },
			{
				optional: false,
				type: 'object',
				props: {
					id: { type: 'string' },
					module: { type: 'string' },
					command: { type: 'string' },
					fee: { type: 'string' },
					nonce: { type: 'string' },
					senderPublicKey: { type: 'string' },
					signatures: { type: 'array', items: 'string' },
					params: { type: 'object' },
				},
			},
		],
	},
	get schema() {
		const transactionCalculateFeesSchema = {};
		transactionCalculateFeesSchema[this.swaggerApiPath] = { post: {} };
		transactionCalculateFeesSchema[this.swaggerApiPath].post.tags = this.tags;
		transactionCalculateFeesSchema[this.swaggerApiPath].post.summary = 'Calculate estimated fees for the transaction.';
		transactionCalculateFeesSchema[this.swaggerApiPath].post.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Calculate estimated fees for the transaction.',
		});
		transactionCalculateFeesSchema[this.swaggerApiPath].post.parameters = [{ $ref: '#/parameters/transactionCalculateFees' }];
		transactionCalculateFeesSchema[this.swaggerApiPath].post.responses = {
			200: {
				description: 'Returns estimated fees required for the given transaction.',
				schema: {
					$ref: '#/definitions/txCalculateFeesWithEnvelope',
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
		return transactionCalculateFeesSchema;
	},
	source: transactionsCalculateFeesSource,
};
