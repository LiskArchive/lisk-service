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
	Logger,
} = require('lisk-service-framework');

const {
	getEstimateFeeByteNormal,
	getEstimateFeeByteQuick,
} = require('../shared/core/dynamicFees');

const logger = Logger();

module.exports = [
	{
		name: 'update.fee_estimates',
		description: 'Initiate the dynamic fee estimates algorithm',
		schedule: '0 0 1 1 *', // Once a year
		updateOnInit: true,
		init: () => {
			logger.debug('Initiate the dynamic fee estimates computation');

			getEstimateFeeByteNormal();
			getEstimateFeeByteQuick();
		},
		controller: () => { },
	},
];
