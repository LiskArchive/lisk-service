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

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions/statistics',
	rpcMethod: 'get.transactions.statistics',
	tags: ['Transactions'],
	params: {
		interval: { optional: true, type: 'string' },
		offset: { optional: true, type: 'number', default: 0, min: 0 },
		limit: { optional: true, type: 'number', default: 10, min: 1, max: 100 },
	},
	paramsRequired: true,
	validParamPairings: [
		['interval'],
	],
	source: transactionsStatisticsSource,
	envelope,
};
