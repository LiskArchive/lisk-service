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
const transactionsStatisticsMonthSource = require('../../../sources/version1/transactionsStatisticsMonth');
const envelope = require('../../../sources/version1/mappings/stdEnvelope');

module.exports = {
	version: '2.0',
	method: 'get.transactions.statistics.month',
	envelope,
	params: {
		offset: { required: false, default: 0, min: 0 },
		limit: { required: false, default: 10, min: 1, max: 12 },
	},
	source: transactionsStatisticsMonthSource,
	ttl: 1000 * 60 * 10,
};
