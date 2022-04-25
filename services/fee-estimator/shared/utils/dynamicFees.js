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
const { Logger } = require('lisk-service-framework');

const config = require('../../config');

const logger = Logger();

const calcAvgFeeByteModes = {
	MEDIUM: 'med',
	HIGH: 'high',
};

const EMAcalc = (feePerByte, prevFeeEstPerByte) => {
	const calcExpDecay = (emaBatchSize, emaDecayRate) => (
		1 - Math.pow(1 - emaDecayRate, 1 / emaBatchSize)).toFixed(5);

	const alpha = calcExpDecay(config.feeEstimates.emaBatchSize, config.feeEstimates.emaDecayRate);
	logger.debug(`Estimating fees with 'α' for EMA set to ${alpha}.`);

	const feeEst = {};
	if (Object.keys(prevFeeEstPerByte).length === 0) prevFeeEstPerByte = {
		low: 0,
		med: 0,
		high: 0,
	};
	Object.keys(feePerByte).forEach((property) => {
		feeEst[property] = alpha * feePerByte[property] + (1 - alpha) * prevFeeEstPerByte[property];
	});

	const EMAoutput = {
		feeEstLow: feeEst.low,
		feeEstMed: feeEst.med,
		feeEstHigh: feeEst.high,
	};
	return EMAoutput;
};

module.exports = {
	calcAvgFeeByteModes,
	EMAcalc,
};
