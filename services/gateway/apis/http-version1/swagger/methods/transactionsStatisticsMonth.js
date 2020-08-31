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

const transactionsStatisticsMonth = require('../../methods/transactionsStatisticsMonth');
const { transformParams } = require('../utils');

const key = transactionsStatisticsMonth.swaggerApiPath;
const transactionSchema = {};
transactionSchema[key] = { get: {} };
transactionSchema[key] = { get: { tags: ['Transactions'] } };
transactionSchema[key].get.parameters = transformParams('transactions', transactionsStatisticsMonth.params);
transactionSchema[key].get.responses = {
	200: {
		description: 'array of transactions with details',
		schema: {
			type: 'array',
			items: {
				$ref: '#/definitions/TransactionsStatisticsWithEnvelope',
			},
		},
	},
	400: {
		description: 'bad input parameter',
	},
	404: {
		description: 'Not found',
	},
};
module.exports = transactionSchema;
