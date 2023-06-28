/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const { Logger, Signals } = require('lisk-service-framework');
const { getEstimateFeePerByte } = require('../shared/dynamicFees');

const logger = Logger();

module.exports = [
	{
		name: 'update.fee_estimates',
		description: 'Keep the fee estimates up-to-date',
		controller: callback => {
			const newFeeEstimateListener = async () => {
				try {
					logger.debug('Returning latest fee_estimates to the socket.io client...');
					const restData = await getEstimateFeePerByte();

					if (typeof restData === 'object' && Object.keys(restData).length > 0 && restData.status !== 'SERVICE_UNAVAILABLE') callback(restData);
				} catch (err) {
					logger.error(`Error occurred when processing 'update.fee_estimates' event:\n${err.stack}`);
				}
			};
			Signals.get('newFeeEstimate').add(newFeeEstimateListener);
		},
	},
];
