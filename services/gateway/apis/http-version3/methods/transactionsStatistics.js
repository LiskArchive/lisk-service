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
const transactionsStatisticsSource = require('../../../sources/version3/transactionsStatistics');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions/statistics',
	rpcMethod: 'get.transactions.statistics',
	tags: ['Transactions'],
	params: {
		interval: { optional: false, type: 'string', enum: ['day', 'month'] },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10, pattern: /^\b((?:[1-9][0-9]?)|100)\b$/ },
		offset: { optional: true, type: 'number', min: 0, default: 0, pattern: /^\b([0-9][0-9]*)\b$/ },
	},
	get schema() {
		const transactionSchema = {};
		transactionSchema[this.swaggerApiPath] = { get: {} };
		transactionSchema[this.swaggerApiPath].get.tags = this.tags;
		transactionSchema[this.swaggerApiPath].get.summary = 'Requests transaction statistics';
		transactionSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns transaction statistics',
		});
		transactionSchema[this.swaggerApiPath].get.parameters = transformParams('transactions', this.params);
		transactionSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of transactions statistics by date or month',
				schema: {
					$ref: '#/definitions/TransactionsStatisticsWithEnvelope',
				},
			},
		};
		Object.assign(transactionSchema[this.swaggerApiPath].get.responses, response);
		return transactionSchema;
	},
	source: transactionsStatisticsSource,
	envelope,
};
