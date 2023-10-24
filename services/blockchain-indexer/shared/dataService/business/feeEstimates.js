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
const logger = require('lisk-service-framework').Logger();

const { requestFeeEstimator, requestConnector } = require('../../utils/request');

let feeEstimates = {
	low: 0,
	med: 0,
	high: 0,
	minFeePerByte: 1000,
};

const setFeeEstimates = async payload => {
	if (payload && Object.keys(payload).length > 0 && payload.status !== 'SERVICE_UNAVAILABLE') {
		feeEstimates = payload;
	}
};

const getFeeEstimates = () => feeEstimates;

const getFeeEstimatesFromFeeEstimator = async () => {
	try {
		const response = await requestFeeEstimator('estimates');
		setFeeEstimates(response);
	} catch (err) {
		logger.warn(`Failed to fetch fee estimates from fee-estimator. Error:${err.message}`);
	}

	return getFeeEstimates();
};

const initFeeEstimates = async () => {
	feeEstimates.feeTokenID = await requestConnector('getFeeTokenID');
	feeEstimates.minFeePerByte = await requestConnector('getMinFeePerByte');
};

module.exports = {
	initFeeEstimates,
	setFeeEstimates,
	getFeeEstimates,
	getFeeEstimatesFromFeeEstimator,

	// for testing
	defaultFeeEstimates: feeEstimates,
};
