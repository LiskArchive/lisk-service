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
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions',
	rpcMethod: 'get.transactions',
	tags: ['Transactions'],
	params: {
		transactionID: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.HASH_SHA256 },
		moduleCommandID: { optional: true, type: 'string', min: 1, max: 21 },
		moduleCommandName: { optional: true, type: 'string', min: 1 },
		senderAddress: { optional: true, type: 'string', min: 3, max: 41, pattern: regex.ADDRESS_BASE32 },
		blockID: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.HASH_SHA256 },
		height: { optional: true, type: 'string', min: 1, pattern: regex.HEIGHT_RANGE },
		timestamp: { optional: true, type: 'string', min: 1, pattern: regex.TIMESTAMP_RANGE },
		executionStatus: {
			optional: true,
			type: 'string',
			pattern: regex.TRANSACTION_EXECUTION_STATUS,
			default: 'any',
		},
		nonce: { optional: true, type: 'string', min: 1, pattern: regex.NONCE },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		sort: {
			optional: true,
			type: 'string',
			enum: ['amount:asc', 'amount:desc', 'timestamp:asc', 'timestamp:desc'],
			default: 'timestamp:desc',
		},
	},
	get schema() {
		const transactionSchema = {};
		transactionSchema[this.swaggerApiPath] = { get: {} };
		transactionSchema[this.swaggerApiPath].get.tags = this.tags;
		transactionSchema[this.swaggerApiPath].get.summary = 'Requests transactions data';
		transactionSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns transactions data',
		});
		transactionSchema[this.swaggerApiPath].get.parameters = transformParams('transactions', this.params);
		transactionSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of transactions',
				schema: {
					$ref: '#/definitions/TransactionsWithEnvelope',
				},
			},
		};
		Object.assign(transactionSchema[this.swaggerApiPath].get.responses, response);
		return transactionSchema;
	},
	source: transactionsSource,
	envelope,
};
