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
const { Logger } = require('lisk-service-framework');
const { requestFeeEstimator } = require('../../utils/request');

const logger = Logger();

let feeEstimates;

const reloadFeeEstimates = async (payload) => {
	if (typeof payload === 'undefined') {
		logger.warn('Fee estimator event returned undefined payload.');
	} else {
		feeEstimates = payload;
	}
};

const getFeeEstimates = async () => {
	if (typeof feeEstimates === 'undefined') feeEstimates = await requestFeeEstimator('estimates');
	return feeEstimates;
};

module.exports = {
	reloadFeeEstimates,
	getFeeEstimates,
};
