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
const transactionsEstimateFeesSource = require('../../../sources/version3/transactionsEstimateFees');
const { getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions/estimate-fees',
	httpMethod: 'POST',
	rpcMethod: 'post.transactions.estimate-fees',
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
		const transactionsEstimateFeesSchema = {};
		transactionsEstimateFeesSchema[this.swaggerApiPath] = { post: {} };
		transactionsEstimateFeesSchema[this.swaggerApiPath].post.tags = this.tags;
		transactionsEstimateFeesSchema[this.swaggerApiPath].post.summary = 'Requests estimated fees for the transaction.';
		transactionsEstimateFeesSchema[this.swaggerApiPath].post.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns estimated fees for the transaction.',
		});
		transactionsEstimateFeesSchema[this.swaggerApiPath].post.parameters = [{ $ref: '#/parameters/transactionEstimateFees' }];
		transactionsEstimateFeesSchema[this.swaggerApiPath].post.responses = {
			200: {
				description: 'Returns estimated fees for the given transaction.',
				schema: {
					$ref: '#/definitions/txEstimateFeesWithEnvelope',
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
		return transactionsEstimateFeesSchema;
	},
	source: transactionsEstimateFeesSource,
};
