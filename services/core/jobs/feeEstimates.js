/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const {
	CacheRedis,
	Logger,
} = require('lisk-service-framework');

const {
	getEstimateFeeByteNormal,
	getEstimateFeeByteQuick,
} = require('../shared/core/dynamicFees');

const config = require('../config');

const logger = Logger();

module.exports = [
	{
		name: 'update.fee_estimates',
		description: 'Initiate the dynamic fee estimates algorithm',
		interval: 60, // TODO: Switch to schedule?
		updateOnInit: true,
		init: async () => {
			logger.debug('Initiate the dynamic fee estimates computation');

			// For dev purpose
			const cacheRedisFees = CacheRedis('fees', config.endpoints.redis);
			await cacheRedisFees.delete('lastFeeEstimate');
			await cacheRedisFees.delete('lastFeeEstimateQuick');

			getEstimateFeeByteNormal();
			getEstimateFeeByteQuick();
		},
		controller: () => { },
	},
];
