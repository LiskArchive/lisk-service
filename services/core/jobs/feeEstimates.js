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
const logger = require('lisk-service-framework').Logger();

const config = require('../config');
const { getLastBlock } = require('../shared/core/blocks');
const dynamicFees = require('../shared/core/dynamicFees');

module.exports = [
	{
		name: 'update.fee_estimates',
		description: 'Initiate the dynamic fee estimates algorithm',
		interval: 1,
		updateOnInit: true,
		init: async () => {
			logger.debug('Initiate the dynamic fee estimates computation');
			dynamicFees.getEstimateFeeByteQuick();
			dynamicFees.getEstimateFeeByteForBatch(
				config.feeEstimates.defaultStartBlockHeight,
				getLastBlock().height,
			);
		},
		controller: () => { },
	},
];
