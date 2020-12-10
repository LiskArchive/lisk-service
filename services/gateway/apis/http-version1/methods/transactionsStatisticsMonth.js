/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const transactionsStatisticsMonthSource = require('../../../sources/transactionsStatisticsMonth');
const envelope = require('../../../sources/mappings/stdEnvelope');
const { transformParams, response } = require('../swagger/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions/statistics/month',
	rpcMethod: 'get.transactions.statistics.month',
	tags: ['Transactions'],
	params: {
		offset: { optional: true, type: 'number', default: 0, min: 0 },
		limit: { optional: true, type: 'number', default: 10, min: 1, max: 12 },
	},
	get schema() {
		const transactionSchema = {};
		transactionSchema[this.swaggerApiPath] = { get: {} };
		transactionSchema[this.swaggerApiPath].get.tags = this.tags;
		transactionSchema[this.swaggerApiPath].get.parameters = transformParams('transactions', this.params);
		transactionSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'array of transactions statistics per month',
				schema: {
					type: 'array',
					items: {
						$ref: '#/definitions/TransactionsStatisticsWithEnvelope',
					},
				},
			},
		};
		Object.assign(transactionSchema[this.swaggerApiPath].get.responses, response);
		return transactionSchema;
	},
	source: transactionsStatisticsMonthSource,
	envelope,
};
