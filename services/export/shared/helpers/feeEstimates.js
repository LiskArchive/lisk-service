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
let feeEstimates = {
	low: 0,
	med: 0,
	high: 0,
};

const setFeeEstimates = async (payload) => {
	if (payload && Object.keys(payload).length > 0 && payload.status !== 'SERVICE_UNAVAILABLE') {
		feeEstimates = payload;
	}
};

const getFeeEstimates = () => feeEstimates;

module.exports = {
	setFeeEstimates,
	getFeeEstimates,
};
