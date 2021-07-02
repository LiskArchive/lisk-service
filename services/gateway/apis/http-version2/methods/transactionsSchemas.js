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
const transactionSchemaSource = require('../../../sources/version2/transactionsSchemas');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');
const { transformParams, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions/schemas',
	rpcMethod: 'get.transactions.schemas',
	tags: ['Transactions'],
	params: {
		moduleAssetId: { optional: true, type: 'string', min: 3, pattern: /[0-9]+:[0-9]+/ },
		moduleAssetName: { optional: true, type: 'string', min: 3, pattern: /[a-z]+:[a-z]+/ },
	},
	paramsRequired: false,
	validParamPairings: [
		['moduleAssetId'],
		['moduleAssetName'],
	],
	get schema() {
		const transactionSchema = {};
		transactionSchema[this.swaggerApiPath] = { get: {} };
		transactionSchema[this.swaggerApiPath].get.tags = this.tags;
		transactionSchema[this.swaggerApiPath].get.summary = 'Requests transactions schema';
		transactionSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns transaction schemas',
		});
		transactionSchema[this.swaggerApiPath].get.parameters = transformParams('transactions', this.params);
		transactionSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'array of transaction schemas',
				schema: {
					$ref: '#/definitions/TransactionsSchemaWithEnvelope',
				},
			},
			404: {
				description: 'Not found',
				schema: {
					$ref: '#/definitions/notFoundEnvelope',
				},
			},
			400: {
				description: 'Bad input parameter',
			},
		};
		return transactionSchema;
	},
	source: transactionSchemaSource,
	envelope,
};
