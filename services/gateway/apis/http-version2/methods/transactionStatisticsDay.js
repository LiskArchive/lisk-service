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
const transactionsStatisticsDaySource = require('../../../sources/version2/transactionsStatisticsDay');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions/statistics/day',
	rpcMethod: 'get.transactions.statistics.day',
	tags: ['Transactions'],
	params: {
		offset: { optional: true, type: 'number', default: 0, min: 0 },
		limit: { optional: true, type: 'number', default: 10, min: 1, max: 100 },
	},
	get schema() {
		const transactionSchema = {};
		transactionSchema[this.swaggerApiPath] = { get: {} };
		transactionSchema[this.swaggerApiPath].get.tags = this.tags;
		transactionSchema[this.swaggerApiPath].get.summary = 'Requests transaction statistics day';
		transactionSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns transaction statistics aggregates per day',
		});
		transactionSchema[this.swaggerApiPath].get.parameters = transformParams('transactions', this.params);
		transactionSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'array of transactions statistics aggregated per day',
				schema: {
					$ref: '#/definitions/TransactionsStatisticsWithEnvelope',
				},
			},
		};
		Object.assign(transactionSchema[this.swaggerApiPath].get.responses, response);
		return transactionSchema;
	},
	source: transactionsStatisticsDaySource,
	envelope,
};
