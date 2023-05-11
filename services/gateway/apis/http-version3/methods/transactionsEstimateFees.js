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
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const { getSwaggerDescription } = require('../../../shared/utils');
const regex = require('../../../shared/regex');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions/estimate-fees',
	httpMethod: 'POST',
	rpcMethod: 'post.transactions.estimate-fees',
	tags: ['Transactions'],
	params: {
		transaction: {
			optional: false,
			type: 'object',
			props: {
				id: { optional: true, type: 'string', pattern: regex.HASH_SHA256 },
				module: { optional: false, type: 'string', pattern: regex.MODULE },
				command: { optional: false, type: 'string', pattern: regex.COMMAND },
				fee: { optional: true, type: 'string', pattern: regex.FEE },
				nonce: { optional: false, type: 'string', pattern: regex.NONCE },
				senderPublicKey: { optional: false, type: 'string', pattern: regex.PUBLIC_KEY },
				signatures: { optional: true, type: 'array', min: 0, items: { type: 'string', pattern: regex.HASH_SHA512 } },
				params: { optional: false, type: 'object' },
			},
		},
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
	envelope,
};
